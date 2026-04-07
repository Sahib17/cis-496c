import mongoose from "mongoose";

const Schema = mongoose.Schema

const inviteSchema = new Schema({
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        reuired: true,
        index: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    invitedTo: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    status: {
        type: string,
        enum: ["PENDING", "ACCEPTED", "EXPIRED", "REVOKED"],
        default: "PENDING",
    },
    expiresAt: {
        type: Date,
        required: true,
        index: {expires: 0}
    },
}, {timestamps: true})

const Invite = mongoose.model("Invite", inviteSchema);
export default Invite;