import React from "react";
import { act, screen, waitFor } from "@testing-library/react";
import { render } from "../utils/test-utils";
import { PersonalisedAnalytics } from "@/components/dashboard/personalised-analytics";
import { mockAuthUser } from "../utils/test-constants";
import { DEFAULT_STUDENT_PERSONALISED_ANALYTICS } from "@/lib/constants";
import { StudentPersonalisedAnalytics } from "@/lib/types";

jest.mock("recharts", () => {
  const React = require("react");
  return {
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
  };
});

// Define state outside the mock
let analyticsState = {
  loading: true,
  analytics: null,
};

const fetchAnalyticsMock = jest.fn(() => {
  // Simulate the hook's behavior: set loading to true
  act(() => {
    analyticsState.loading = true;
  });

  // Simulate async data loading
  act(() => {
    analyticsState.loading = false;
    analyticsState.analytics = {
      ...DEFAULT_STUDENT_PERSONALISED_ANALYTICS,
      progressTrend: [{ date: "10-10-2026", score: 20 }],
      categoryScores: {
        technical: {
          average: 10,
          count: 1,
        },
      },
    } satisfies StudentPersonalisedAnalytics;
  });
});

jest.mock("../../src/lib/hooks", () => ({
  useStudentPersonalisedAnalytics: () => ({
    fetchAnalytics: fetchAnalyticsMock,
    get analyticsLoading() {
      return analyticsState.loading;
    },
    get analytics() {
      return analyticsState.analytics;
    },
  }),
}));

describe("PersonalisedAnalytics Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // (global.fetch as jest.Mock).mockResolvedValue({
    //   ok: true,
    //   json: async () => ({
    //     overallReadinessScore: 75,
    //     averageScore: 80,
    //     recommendations: [
    //       {
    //         title: "Improve Technical Skills",
    //         description: "Focus on technical interviews",
    //         priority: "high",
    //         actionItems: ["Practice coding", "Review algorithms"],
    //       },
    //     ],
    //     categoryAverages: {
    //       behavioral: { average: 85, count: 3 },
    //       technical: { average: 70, count: 2 },
    //     },
    //     progressTrend: [
    //       { date: "2024-01-01", score: 70 },
    //       { date: "2024-01-02", score: 75 },
    //     ],
    //     recentInterviews: [
    //       {
    //         id: "1",
    //         category: "behavioral",
    //         score: 85,
    //         date: new Date().toISOString(),
    //       },
    //     ],
    //   }),
    // });
  });

  it("should render loading state initially", async () => {
    render(<PersonalisedAnalytics />);

    await waitFor(() => {
      expect(
        screen.getByTestId("personalised-analytics-loading-skeleton"),
      ).toBeInTheDocument();
    });
  });

  it("should display readiness score section", async () => {
    render(<PersonalisedAnalytics />);

    await waitFor(() => {
      expect(fetchAnalyticsMock).toHaveBeenCalledWith({
        userId: mockAuthUser.uid,
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Interview Readiness Score/i),
      ).toBeInTheDocument();
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
        screen.getByText(/Start a behavioral interview/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Try a technical interview/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Practice with the AI copilot/i),
      ).toBeInTheDocument();
    });
  });

  it("should display recent interviews section", async () => {
    render(<PersonalisedAnalytics />);

    await waitFor(() => {
      expect(screen.getByText(/Recent Interviews/i)).toBeInTheDocument();
      expect(screen.getByText(/10-10-2026/i)).toBeInTheDocument();
    });
  });

  // it("should handle fetch errors gracefully", async () => {
  //   (global.fetch as jest.Mock).mockRejectedValue(new Error("Fetch failed"));

  //   render(<PersonalisedAnalytics />);

  //   await waitFor(() => {
  //     expect(screen.getByText(/Failed to load analytics/i)).toBeInTheDocument();
  //   });
  // });

  // it("should calculate and display readiness percentage", async () => {
  //   render(<PersonalisedAnalytics />);

  //   await waitFor(() => {
  //     expect(screen.getByText(/75/)).toBeInTheDocument();
  //   });
  // });
});
