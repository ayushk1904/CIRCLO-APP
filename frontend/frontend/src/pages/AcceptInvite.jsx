import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { acceptInvite } from "../services/circle.service";
import { useAuth } from "../context/AuthContext";

const InviteAccept = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [status, setStatus] = useState("joining");

  useEffect(() => {
    if (loading) return; // wait until auth loads

    if (!user) {
      alert("Please login to accept invite");
      navigate("/login");
      return;
    }

    const join = async () => {
      try {
        await acceptInvite(token);
        setStatus("success");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } catch (err) {
        console.error(err);
        setStatus("error");

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    };

    join();
  }, [token, navigate, user, loading]);

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      {status === "joining" && <h3>Joining circle...</h3>}
      {status === "success" && <h3>✅ Joined successfully!</h3>}
      {status === "error" && <h3>❌ Invite expired or invalid</h3>}
    </div>
  );
};

export default InviteAccept;
