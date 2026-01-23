import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div>
      <div className="flex justify-end">
        <Button
          className="mr-10 -mt-14
        "
        >
          Sign Up
        </Button>
      </div>
      <div className="flex justify-center mt-10">
        <div className="flex flex-col items-center gap-y-3 w-[300px]">
          <div className="w-full">
            <span>Role</span>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="software developer">
                  Software Developer
                </SelectItem>
                <SelectItem value="project manager">Project Manager</SelectItem>
                <SelectItem value="service representative">
                  Service Representative
                </SelectItem>
                <SelectItem value="digital marketing specialist">
                  Digital Marketing Specialist
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full">
            <span>Company</span>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="amazon">Amazon</SelectItem>
                <SelectItem value="netflix">Netflix</SelectItem>
                <SelectItem value="google">Google</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="default" size="lg" className="w-full">
            Start Practice
          </Button>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="flex gap-12 mt-10">
          <Card>
            <CardContent>
              <div className=" flex justify-center items-center text-xl font-semibold w-[200px] h-[200px]">
                Mock Interview Prep
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              {" "}
              <div className="flex justify-center items-center text-xl font-semibold w-[200px] h-[200px]">
                Interview Copilot
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              {" "}
              <div className="flex justify-center items-center text-xl font-semibold w-[200px] h-[200px]">
                Interview Tips
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
