"use client";
import React from "react";
import Countdown, { zeroPad } from "react-countdown";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export default function MockInterviewPage() {
  const [delayInMs, setDelayInMs] = React.useState(10000);
  return (
    <div className="flex justify-center mt-32">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="grid items-center grid-cols-3">
            <div>&nbsp;</div>
            <CardTitle>Question 1</CardTitle>
            <div className="ml-auto">
              <Countdown
                key={delayInMs}
                date={Date.now() + delayInMs}
                renderer={({ minutes, seconds, completed, total }) => {
                  const retryCount = delayInMs / 10000;

                  //render a countdown
                  const percentage = (total * 100) / delayInMs;
                  return (
                    <div className="h-20 w-20">
                      <CircularProgressbarWithChildren
                        value={percentage}
                        styles={buildStyles({
                          // Rotation of path and trail, in number of turns (0-1)
                          rotation: 0.25,

                          // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                          strokeLinecap: "round",

                          // Text size
                          textSize: "16px",

                          // How long animation takes to go from one percentage to another, in seconds
                          pathTransitionDuration: 0.5,

                          // Can specify path transition in more detail, or remove it entirely
                          // pathTransition: 'none',

                          // Colors
                          pathColor: `rgba(0, 142, 110, ${percentage / 100})`,
                          textColor: "#f88",
                          trailColor: "#d6d6d6",
                          backgroundColor: "#3e98c7",
                        })}
                      >
                        <h1 className="font-serif text-xl font-medium">
                          {minutes}:{zeroPad(seconds)}
                        </h1>
                      </CircularProgressbarWithChildren>
                    </div>
                  );
                }}
              />
            </div>
          </div>
          <CardDescription>Tell me about yourself</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea placeholder="Type your message here." />
        </CardContent>
        <CardFooter>
          <Button>Next</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
