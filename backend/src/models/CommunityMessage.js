import mongoose from 'mongoose';

const communityMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    text: {
      type: String,
      required: false, // Optional because a message could just be an image
      trim: true,
      maxlength: 1000,
    },
    imageUrl: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const CommunityMessage = mongoose.model('CommunityMessage', communityMessageSchema);

export default CommunityMessage;
