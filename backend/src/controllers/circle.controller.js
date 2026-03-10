const Circle = require("../models/Circle");
const User = require("../models/User");

/* 🔐 ROLE CHECK HELPER (FIXED) */
const hasRole = (circle, userId, roles) => {
  return circle.members.some((m) => {
    const memberId = m.user?._id
      ? m.user._id.toString()   // when populated
      : m.user.toString();      // when not populated

    return (
      memberId === userId.toString() &&
      roles.includes(m.role)
    );
  });
};

/**
 * CREATE circle
 * POST /api/circles
 */
exports.createCircle = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Circle name required" });
    }

    const circle = await Circle.create({
      name: name.trim(),
      description: description?.trim(),
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "owner",
        },
      ],
    });

    res.status(201).json({ circle });
  } catch (err) {
    console.error("Create circle error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET logged-in user's circles
 * GET /api/circles
 */
exports.getMyCircles = async (req, res) => {
  try {
    const circles = await Circle.find({
      "members.user": req.user._id,
    })
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar")
      .sort({ createdAt: -1 });

    res.json({ circles });
  } catch (err) {
    console.error("Get circles error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * GET single circle
 * GET /api/circles/:id
 */
exports.getCircleById = async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    if (!circle) {
      return res.status(404).json({ message: "Circle not found" });
    }

    if (!hasRole(circle, req.user._id, ["owner", "admin", "member"])) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({ circle });
  } catch (err) {
    console.error("Get circle error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * UPDATE circle (Owner only)
 * PUT /api/circles/:id
 */
exports.updateCircle = async (req, res) => {
  try {
    const { name, description } = req.body;
    const circle = await Circle.findById(req.params.id);

    if (!circle) {
      return res.status(404).json({ message: "Circle not found" });
    }

    if (!hasRole(circle, req.user._id, ["owner"])) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (name?.trim()) circle.name = name.trim();
    if (description !== undefined)
      circle.description = description.trim();

    await circle.save();
    res.json({ circle });
  } catch (err) {
    console.error("Update circle error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE circle (Owner only)
 * DELETE /api/circles/:id
 */
exports.deleteCircle = async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id);

    if (!circle) {
      return res.status(404).json({ message: "Circle not found" });
    }

    if (!hasRole(circle, req.user._id, ["owner"])) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await circle.deleteOne();
    res.json({ message: "Circle deleted successfully" });
  } catch (err) {
    console.error("Delete circle error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * INVITE member (Owner/Admin)
 * POST /api/circles/:id/invite
 */
const crypto = require("crypto");

exports.inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    const circle = await Circle.findById(req.params.id);

    if (!circle)
      return res.status(404).json({ message: "Circle not found" });

    if (!hasRole(circle, req.user._id, ["owner", "admin"]))
      return res.status(403).json({ message: "Not authorized" });

    const alreadyInvited = circle.invites.some(
      (i) => i.email === email
    );

    if (alreadyInvited)
      return res.status(400).json({ message: "Already invited" });

    const token = require("crypto").randomBytes(32).toString("hex");

    circle.invites.push({
      email,
      token,
      invitedBy: req.user._id,
    });

    await circle.save();

    res.json({ message: "Invite sent successfully" });
  } catch (err) {
    console.error("Invite error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




exports.getMyInvites = async (req, res) => {
  try {
    const circles = await Circle.find({
      "invites.email": req.user.email,
    });

    const invites = [];

    circles.forEach((circle) => {
      circle.invites.forEach((invite) => {
        if (invite.email === req.user.email) {
          invites.push({
            circleId: circle._id,
            circleName: circle.name,
            token: invite.token,
          });
        }
      });
    });

    res.json({ invites });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



exports.acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;

    // 1️⃣ Find user with this invite token
    const user = await User.findOne({
      "invites.token": token,
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid invite" });
    }

    // 2️⃣ Get invite
    const invite = user.invites.find(i => i.token === token);

    if (!invite) {
      return res.status(400).json({ message: "Invite expired" });
    }

    // 3️⃣ Find circle
    const circle = await Circle.findById(invite.circle);

    if (!circle) {
      return res.status(404).json({ message: "Circle not found" });
    }

    // 4️⃣ Add user to circle (if not already)
    const alreadyMember = circle.members.some(
      m => m.user.toString() === user._id.toString()
    );

    if (!alreadyMember) {
      circle.members.push({
        user: user._id,
        role: "member",
      });
    }

    // 5️⃣ Remove invite
    user.invites = user.invites.filter(i => i.token !== token);

    await user.save();
    await circle.save();

    res.json({
      message: "Joined circle successfully",
      circleId: circle._id,
    });

  } catch (err) {
    console.error("Accept invite error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




// GET pending invites for logged-in user
exports.getMyInvites = async (req, res) => {
  try {
    const circles = await Circle.find({
      "invites.email": req.user.email,
    }).select("name invites");

    const invites = [];

    circles.forEach(circle => {
      circle.invites.forEach(invite => {
        if (invite.email === req.user.email) {
          invites.push({
            circleId: circle._id,
            circleName: circle.name,
            token: invite.token,
            invitedBy: invite.invitedBy,
          });
        }
      });
    });

    res.json({ invites });
  } catch (err) {
    console.error("Get invites error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * REMOVE member (Owner/Admin)
 * DELETE /api/circles/:id/members/:userId
 */
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const circle = await Circle.findById(req.params.id);

    if (!circle) {
      return res.status(404).json({ message: "Circle not found" });
    }

    if (!hasRole(circle, req.user._id, ["owner", "admin"])) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const member = circle.members.find((m) => {
      const memberId = m.user?._id
        ? m.user._id.toString()
        : m.user.toString();
      return memberId === userId;
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (member.role === "owner") {
      return res.status(400).json({ message: "Cannot remove owner" });
    }

    circle.members = circle.members.filter((m) => {
      const memberId = m.user?._id
        ? m.user._id.toString()
        : m.user.toString();
      return memberId !== userId;
    });

    await circle.save();
    res.json({ message: "Member removed" });
  } catch (err) {
    console.error("Remove member error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * LEAVE circle (Non-owner)
 * POST /api/circles/:id/leave
 */
exports.leaveCircle = async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id);
    if (!circle) {
      return res.status(404).json({ message: "Circle not found" });
    }

    const me = circle.members.find((m) => {
      const memberId = m.user?._id
        ? m.user._id.toString()
        : m.user.toString();
      return memberId === req.user._id.toString();
    });

    if (!me) {
      return res.status(400).json({ message: "Not a member" });
    }

    if (me.role === "owner") {
      return res.status(400).json({ message: "Owner cannot leave" });
    }

    circle.members = circle.members.filter((m) => {
      const memberId = m.user?._id
        ? m.user._id.toString()
        : m.user.toString();
      return memberId !== req.user._id.toString();
    });

    await circle.save();
    res.json({ message: "Left circle" });
  } catch (err) {
    console.error("Leave circle error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PROMOTE / DEMOTE member (Owner only)
 * PUT /api/circles/:id/members/:userId/role
 */
exports.updateMemberRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const circle = await Circle.findById(req.params.id);
    if (!circle) {
      return res.status(404).json({ message: "Circle not found" });
    }

    if (!hasRole(circle, req.user._id, ["owner"])) {
      return res.status(403).json({ message: "Only owner can change roles" });
    }

    const member = circle.members.find((m) => {
      const memberId = m.user?._id
        ? m.user._id.toString()
        : m.user.toString();
      return memberId === userId;
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (member.role === "owner") {
      return res.status(400).json({ message: "Cannot change owner role" });
    }

    member.role = role;
    await circle.save();

    res.json({ message: "Role updated", userId, role });
  } catch (err) {
    console.error("Role update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
