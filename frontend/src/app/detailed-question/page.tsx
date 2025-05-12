"use client";

import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/Common/Breadcrumb";
import QuestionDetail from "@/components/DetailedQuestions/detailedQuestion";

const DetailedQuestion = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // Extract the 'id' from the query parameter

  return (
    <>
      {/* <Breadcrumb
        pageName=""
        description=""
      /> */}
      <div className="mt-28">
        
      </div>
      {/* Pass the `id` as a prop to the QuestionDetail component */}
      {id && <QuestionDetail id={id} />}
    </>
  );
};

export default DetailedQuestion;
