import React from "react";
import { act, screen, waitFor } from "@testing-library/react";
import { render } from "../utils/test-utils";
import { PersonalisedAnalytics } from "@/components/dashboard/personalised-analytics";
import { mockAuthUser } from "../utils/test-constants";
import { DEFAULT_STUDENT_PERSONALISED_ANALYTICS } from "@/lib/constants";
import { StudentPersonalisedAnalytics } from "@/lib/types";
import { useStudentPersonalisedAnalytics } from "@/lib/hooks";
import { useAuth } from "@/lib/context/auth-context";

jest.mock("recharts", () => ({
  LineChart: ({ children }: any) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }: any) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

const analyticsMockData: StudentPersonalisedAnalytics = {
  ...DEFAULT_STUDENT_PERSONALISED_ANALYTICS,
  progressTrend: [{ date: "10-10-2026", score: 20 }],
  categoryScores: {
    technical: {
      average: 10,
      count: 1,
    },
  },
};

(useAuth as jest.Mock).mockReturnValue({
  user: mockAuthUser,
});

let analytics: StudentPersonalisedAnalytics;
let analyticsLoading = true;
const fetchAnalyticsMock = jest.fn(
  () =>
    new Promise<void>((resolve) => {
      analytics = analyticsMockData;
      resolve();
      analyticsLoading = false;
    }),
);

(useStudentPersonalisedAnalytics as jest.Mock).mockImplementation(() => ({
  fetchAnalytics: fetchAnalyticsMock,
  get analytics() {
    return analytics;
  },
  get analyticsLoading() {
    return analyticsLoading;
  },
}));

describe("PersonalisedAnalytics Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading state initially", async () => {
    render(<PersonalisedAnalytics />);

    await waitFor(() => {
      expect(fetchAnalyticsMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("personalised-analytics-loading-skeleton"),
      ).toBeInTheDocument();
    });
  });

  it("should display readiness score section", async () => {
    render(<PersonalisedAnalytics />);

    await waitFor(() => {
      expect(fetchAnalyticsMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText("Interview Readiness Score")).toBeInTheDocument();
    });
  });

  it("should display progress chart", async () => {
    render(<PersonalisedAnalytics />);

    await waitFor(() => {
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });

  it("should display skills breakdown chart", async () => {
    render(<PersonalisedAnalytics />);

    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });
  });

  it("should display personalized recommendations", async () => {
    render(<PersonalisedAnalytics />);

    await waitFor(() => {
      expect(
        screen.getByText("Start a behavioral interview"),
      ).toBeInTheDocument();
      expect(screen.getByText("Try a technical interview")).toBeInTheDocument();
      expect(
        screen.getByText("Practice with the AI copilot"),
      ).toBeInTheDocument();
    });
  });

  it("should display recent interviews section", async () => {
    render(<PersonalisedAnalytics />);

    await waitFor(() => {
      expect(screen.getByText("Recent Interviews")).toBeInTheDocument();
      expect(screen.getByText("10-10-2026")).toBeInTheDocument();
    });
  });
});
