import mongoose from "mongoose";

const Schema = mongoose.Schema;

const groupMemberSchema = new Schema (
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: "true",
            index: true,
        },
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: "true",
            index: true,
        },
        status: {
            type: String,
            enum: ["INVITED", "JOINED", "LEFT", "REMOVED"],
            required: true,
        },
        role: {
            type: String,
            enum: ["ADMIN", "MEMBER"],
            default: "MEMBER",
        }
    }
)

const GroupMember = mongoose.model("GroupMember", groupMemberSchema);

export default GroupMember;
