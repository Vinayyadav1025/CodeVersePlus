import { Blog } from "@/types/blog";

const blogData: Blog[] = [
  {
    id: 1,
    title: "Enhancing Competitive Programming Skills with AI",
    paragraph:
      "Explore how our AI-powered platform helps improve competitive programming skills by offering personalized challenges, real-time feedback, and in-depth problem-solving strategies tailored to each user’s level.",
    image: "/images/blog/blog-01.jpg",
    author: {
      name: "Vinay Yadav",
      image: "/images/blog/author-01.png",
      designation: "AI Engineer",
    },
    tags: ["AI", "Competitive Programming", "Skill Enhancement"],
    publishDate: "04/2025",
  },
  {
    id: 2,
    title: "Solving Real-World Problems with AI in Code Optimization",
    paragraph:
      "Learn how our AI system assists in optimizing code by analyzing patterns, detecting bugs, and suggesting improvements, ensuring faster problem-solving during coding competitions.",
    image: "/images/blog/blog-02.jpg",
    author: {
      name: "Ram Sharma",
      image: "/images/blog/author-02.png",
      designation: "AI Specialist",
    },
    tags: ["DSA + AI", "Code Optimization", "Problem Solving"],
    publishDate: "02/2025",
  },
  {
    id: 3,
    title: "Integrating AI in Competitive Programming Challenges",
    paragraph:
      "Discover how AI is integrated into competitive programming challenges to provide real-time insights, adaptive difficulty levels, and smart problem recommendations based on your past performance.",
    image: "/images/blog/blog-03.jpg",
    author: {
      name: "Abhishek Kumar",
      image: "/images/blog/author-03.png",
      designation: "Software Developer",
    },
    tags: ["DSA", "Competitive Programming", "Integration"],
    publishDate: "03/2025",
  },
];

export default blogData;
