import Breadcrumb from "@/components/Common/Breadcrumb";
import Problems from"@/components/Problems/Problems";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Page | Free Next.js Template for Startup and SaaS",
  description: "This is Contact Page for Startup Nextjs Template",
  // other metadata
};

const ContactPage = () => {
  return (
    <>
      <div className="mt-28"></div>
      <Problems/>
    </>
  );
};

export default ContactPage;
