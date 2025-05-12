import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Page",
  description: "This is Contact Page.",
  // other metadata
};

const ContactPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Contact Page"
        description="Have questions about CodeVersePlus? Need technical support? We're here to help! Reach out to our team for assistance, feature requests, partnership opportunities, or to share your feedback on our AI-powered programming platform."
      />

      <Contact />
    </>
  );
};

export default ContactPage;
