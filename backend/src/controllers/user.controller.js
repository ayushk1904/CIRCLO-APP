const User = require("../models/User");
const Circle = require("../models/Circle");

/**
 * Upload Avatar
 */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path },
      { new: true }
    ).select("-password");

    res.json({
      message: "Avatar updated",
      avatar: user.avatar,
      user,
    });
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET INVITES
 */
exports.getInvites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("invites.circle", "name")
      .populate("invites.invitedBy", "name");

    res.json({
      invites: user.invites || [],
    });
  } catch (err) {
    console.error("Get invites error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ACCEPT INVITE
 */
exports.acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findById(req.user._id);

    const invite = user.invites.find((i) => i.token === token);
    if (!invite)
      return res.status(400).json({ message: "Invalid invite" });

    const circle = await Circle.findById(invite.circle);

    // Prevent duplicate join
    const alreadyMember = circle.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!alreadyMember) {
      circle.members.push({
        user: req.user._id,
        role: "member",
      });
    }

    // Remove invite
    user.invites = user.invites.filter((i) => i.token !== token);

    await circle.save();
    await user.save();

    res.json({
      message: "Joined circle successfully",
      circleId: circle._id,
    });
  } catch (err) {
    console.error("Accept invite error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * REJECT INVITE
 */
exports.rejectInvite = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findById(req.user._id);
    user.invites = user.invites.filter((i) => i.token !== token);

    await user.save();

    res.json({ message: "Invite rejected" });
  } catch (err) {
    console.error("Reject invite error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
