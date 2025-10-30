import mongoose from "mongoose";
import User from "./User";

const aboutUsSchema = new mongoose.Schema(
  {
    seo: {
      title: { type: String, required: true, default: "Sil3aty - About Us" },
      description: {
        type: String,
        required: true,
        default:
          "Discover the history, mission, and values behind Sil3aty, a modern e-commerce platform.",
      },
    },

    hero: {
      title: {
        type: String,
        required: true,
        default: "Redefining E-Commerce Excellence",
      },
      subtitle: {
        type: String,
        required: true,
        default: "Where Innovation Meets Customer Satisfaction",
      },
    },

    mission: {
      badge: { type: String, required: true, default: "OUR MISSION" },
      title: {
        type: String,
        required: true,
        default: "Building the Future of Digital Commerce",
      },
      description: {
        type: String,
        required: true,
        default:
          "At Sil3aty, we're pioneering a new era of online shopping experiences.",
      },
      stats: [
        {
          value: { type: String, required: true },
          label: { type: String, required: true },
          icon: { type: String, required: true },
        },
      ],
      image: {
        type: String,
        required: true,
        default: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
      },
    },

    timeline: {
      title: { type: String, required: true, default: "Our Evolution" },
      items: [
        {
          year: { type: String, required: true },
          title: { type: String, required: true },
          content: { type: String, required: true },
        },
      ],
    },

    team: {
      title: { type: String, required: true, default: "Visionary Leadership" },
      members: [
        {
          name: { type: String, required: true },
          position: { type: String, required: true },
          description: { type: String, required: true },
          image: { type: String, required: true },
          facebook: { type: String, default: "" },
          linkedin: { type: String, default: "" },
          instagram: { type: String, default: "" },
        },
      ],
    },

    values: {
      title: {
        type: String,
        required: true,
        default: "Our Pillars of Excellence",
      },
      items: [
        {
          icon: { type: String, required: true },
          title: { type: String, required: true },
          description: { type: String, required: true },
          color: { type: String, required: true, default: "primary" },
        },
      ],
    },

    cta: {
      title: {
        type: String,
        required: true,
        default: "Join the Commerce Revolution",
      },
      subtitle: {
        type: String,
        required: true,
        default: "Experience the future of online shopping today",
      },
      buttons: [
        {
          text: { type: String, required: true },
          href: { type: String, required: true },
          variant: { type: String, required: true, default: "primary" },
        },
      ],
    },

    // Metadata
    isActive: { type: Boolean, default: true },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

aboutUsSchema.pre("save", async function (next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

const AboutUs =
  mongoose.models.AboutUs || mongoose.model("AboutUs", aboutUsSchema);

export default AboutUs;
