import PaginationButtons from "@/components/pagination-buttons/PaginationButtons";
import { render } from "../utils/test-utils";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const nextMock = jest.fn().mockName("nextMock");
const previousMock = jest.fn().mockName("PrevMock");
let hasNext = false;
let hasPrev = false;

describe("Pagination Buttons", () => {
  it("should render pagination buttons", async () => {
    render(
      <PaginationButtons
        hasNext={hasNext}
        hasPrev={hasPrev}
        next={nextMock}
        previous={previousMock}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Previous" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it("should disable buttons when hasNext/hasPrev is false", async () => {
    render(
      <PaginationButtons
        hasNext={hasNext}
        hasPrev={hasPrev}
        next={nextMock}
        previous={previousMock}
      />,
    );

    const NextBtn = screen.getByRole("button", { name: "Next" });

    const PrevBtn = screen.getByRole("button", { name: "Previous" });

    expect(PrevBtn).toBeDisabled();
    expect(NextBtn).toBeDisabled();
  });

  it("should fetch previous/next data when buttons are clicked", async () => {
    render(
      <PaginationButtons
        hasNext={true}
        hasPrev={true}
        next={nextMock}
        previous={previousMock}
      />,
    );
    const user = userEvent.setup();

    const NextBtn = screen.getByRole("button", { name: "Next" });

    const PrevBtn = screen.getByRole("button", { name: "Previous" });
    await user.click(NextBtn);
    await waitFor(() => expect(nextMock).toHaveBeenCalled());

    await user.click(PrevBtn);
    await waitFor(() => expect(previousMock).toHaveBeenCalled());
  });
});
