import { Textarea } from "@/components/ui/textarea";
export default function InterviewCopilotPage() {
  return (
    <div className="flex p-20 gap-10">
      <div className="w-[30%] h-[80vh] border border-gray-500 rounded-3xl"></div>
      <div className="relative w-[70%] h-[80vh] border border-gray-500 rounded-3xl">
        <div className="absolute bottom-0 w-full p-10">
          <div className="h-[100px] w-[300px] border border-gray-400 rounded-3xl p-4 text-gray-700 ">
            hello there
          </div>{" "}
          <div className="h-[100px] w-[300px] border border-gray-400 rounded-3xl ml-auto p-4 text-gray-700">
            how are you
          </div>
          <Textarea
            className="rounded-3xl h-[40px] mt-10"
            placeholder="Type your message here."
          />
        </div>
      </div>
    </div>
  );
}
