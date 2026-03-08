import { verifyToken as verifyJWT } from "../utils/jwt.js";
import authService from "../services/auth.service.js";

const verifyToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    const token = header.split(" ")[1];
    const payload = verifyJWT(token);
    const user = await authService.findById(payload.id);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    req.user = { id: user._id, email: user.email, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

/**
 * Factory middleware — ensures the authenticated user owns the requested resource.
 *
 * @param {import("mongoose").Model} Model  - Mongoose model to query
 * @param {...string} ownerFields           - One or more field names that may hold the owner id
 *                                           (e.g. 'ownerId', or 'renterId', 'ownerId' for rentals)
 *
 * Usage:
 *   router.put("/:id", verifyToken, authorizeOwner(Equipment, "ownerId"), handler)
 *   router.delete("/:id", verifyToken, authorizeOwner(Rental, "renterId", "ownerId"), handler)
 */
const authorizeOwner =
  (Model, ...ownerFields) =>
  async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params.id).lean();
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      const userId = req.user.id.toString();
      const isOwner = ownerFields.some((field) => {
        const val = resource[field];
        if (!val) return false;
        // val may be a populated object or a plain ObjectId
        return (val._id ?? val).toString() === userId;
      });

      if (!isOwner) {
        return res
          .status(403)
          .json({ message: "Forbidden — you do not own this resource" });
      }

      // Attach the resource to the request for downstream use
      req.resource = resource;
      next();
    } catch (err) {
      next(err);
    }
  };

export { verifyToken, authorizeOwner };
