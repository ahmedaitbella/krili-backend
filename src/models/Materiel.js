const { Schema, model, Types } = require("mongoose");

const AvailabilityRangeSchema = new Schema(
  {
    from: { type: Date, required: true },
    to: { type: Date, required: true },
  },
  { _id: false }
);

const OwnerDetailsSchema = new Schema(
  {
    id: { type: Types.ObjectId, ref: "User" },
    name: String,
    avatar: String,
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    city: { type: String, required: true },
    neighborhood: String,
    coords: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  { _id: false }
);

const CharacteristicsSchema = new Schema(
  {
    brand: String,
    year: Number,
    condition: { type: String, enum: ["like new", "good", "fair"] },
  },
  { _id: false }
);

const MaterielSchema = new Schema({
  ownerId: { type: Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ["camping", "sports", "tools", "photography", "audio", "vehicles & bikes", "electronics", "other"],
    required: true,
  },
  pricePerDay: { type: Number, required: true },
  images: [String],
  owner: OwnerDetailsSchema,
  address: { type: AddressSchema, required: true },
  availabilityRanges: { type: [AvailabilityRangeSchema], default: [] },
  status: { type: String, enum: ["available", "rented", "unavailable"], default: "available" },
  characteristics: CharacteristicsSchema,
  features: [String],
  rentalTerms: { type: Schema.Types.Mixed },
  numberOfRentals: { type: Number, default: 0 },
  rating: Number,
  reviews: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = model("Materiel", MaterielSchema);