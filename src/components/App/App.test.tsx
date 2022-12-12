import { MemoryRouter } from "react-router-dom";
import { test, expect } from "vitest";
import App from "~/components/App/App";
import { server } from "~/mocks/server";
import { rest } from "msw";
import API_PATHS from "~/constants/apiPaths";
import { CartItem } from "~/models/CartItem";
import { AvailableProduct } from "~/models/Product";
import { renderWithProviders } from "~/testUtils";
import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import { formatAsPrice } from "~/utils/utils";

test("Renders products list", async () => {
  const products: AvailableProduct[] = [
    {
      id: "1",
      description: "Product 1 description",
      title: "Product 1 description",
      price: 1,
      priority: 1,
      placeId: "0001",
      count: 999,
    },
    {
      id: "2",
      description: "Product 2 description",
      title: "Product 2 description",
      price: 2,
      priority: 2,
      placeId: "0002",
      count: 999,
    },
  ];
  server.use(
    rest.get(`${API_PATHS.bff}/products`, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.delay(),
        ctx.json<AvailableProduct[]>(products)
      );
    }),
    rest.get(`${API_PATHS.cart}/profile/cart`, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json<CartItem[]>([]));
    })
  );
  renderWithProviders(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );

  await waitForElementToBeRemoved(() => screen.queryByText(/Loading/));
  products.forEach((product) => {
    expect(screen.getByText(product.description)).toBeInTheDocument();
    expect(screen.getByText(formatAsPrice(product.price))).toBeInTheDocument();
  });
});
