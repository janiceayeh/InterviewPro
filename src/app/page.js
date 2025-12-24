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
      <Button>Sign Up</Button>
      <div>
        <span>Role</span>
        <Select>
          <SelectTrigger className="w-[180px]">
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

      <div>
        <span>Company</span>
        <Select>
          <SelectTrigger className="w-[180px]">
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

      <Button variant="default" size="lg">
        Start Practice
      </Button>

      <Card>
        <CardContent>Mock Interview Prep</CardContent>
      </Card>
      <Card>
        <CardContent>Interview Copilot</CardContent>
      </Card>
      <Card>
        <CardContent>Interview Tips</CardContent>
      </Card>
    </div>
  );
}
