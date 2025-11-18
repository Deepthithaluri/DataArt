import React, { useEffect, useState } from "react";
import "./DashBoard.css";
import MyTests from "./MyTests";
import MyResults from "./MyResults";
import TakeTest from "./TakeTest";
import Profile from "./Profile";
import Loader from "./Loader";
import QuizDetails from "./QuizDetails";
import Layout from "./Layout";
import UploadQuestions from "./UploadQuestions"; // ✅ Add this if not already
import axios from "axios";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [profile, setProfile] = useState(null);

  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  const activeSection = pathSegments[0] || "my-tests";
  const pathURL = window.location.pathname.substring(1);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      localStorage.setItem("attemptedRoute", JSON.stringify({ pathURL }));
      setIsAuthenticated(false);
      window.location.href = "/login";
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [pathURL]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  const renderSection = (section) => {
    if (window.location.pathname.startsWith("/quiz/")) {
      return <QuizDetails />;
    }

    if (!profile) return null;

    const role = profile.role;

    if (role === "admin") {
      switch (section) {
        case "upload-questions":
          return <UploadQuestions />;
        case "profile":
          return <Profile profile={profile} />;
        default:
          return <UploadQuestions />;
      }
    }

    // Default: student
    switch (section) {
      case "my-tests":
        return <MyTests />;
      case "my-results":
        return <MyResults />;
      case "take-test":
        return <TakeTest />;
      case "profile":
        return <Profile profile={profile} />;
      default:
        return <MyTests />;
    }
  };

  return (
    <>
      {!isLoading ? (
        <Layout aria-label="Dashboard layout">
          {isAuthenticated && renderSection(activeSection)}
        </Layout>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Dashboard;
