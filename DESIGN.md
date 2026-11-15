# Design Document — Country Search

## 1. Architecture

The application is divided into several modules, each responsible for a specific task.

- `src/api/searchCountries.ts` — sends HTTP requests to the countries.dev API and handles HTTP errors.
- `src/api/HttpError.ts` — defines a custom HTTP error class.
- `src/api/mapCountryResponse.ts` — transforms API responses into a convenient country data structure.
- `src/types/Country.ts` — contains TypeScript types for raw API data and mapped country data.
- `src/utils/debounce.ts` — implements the debounce utility.
- `src/index.ts` — handles DOM creation, user interactions, search state, request cancellation, and rendering.
- `index.html` — provides the application entry point.
- `style.css` — contains application styles.

The application uses TypeScript, native browser APIs, and the Fetch API. No additional runtime libraries are required.

## 2. Search Optimization: Debounce

Debounce is used to reduce the number of API requests while the user is typing.

The search is executed 400 milliseconds after the last input event. If the user types another character before the delay expires, the previous timer is cleared and a new one is scheduled.

This prevents unnecessary requests for every keystroke.

The debounce utility has:

- Time complexity: O(1) per invocation.
- Auxiliary space complexity: O(1), because it stores one timer and the latest arguments.

## 3. Request Cancellation

An `AbortController` is used to cancel the previous request whenever the input changes.

Cancellation happens immediately on the input event, before the debounced search starts.

This prevents outdated requests from continuing unnecessarily and reduces the chance of displaying stale results.

An additional controller identity check prevents an older request from updating the state of a newer request.

## 4. Request Timeout

Each request has a timeout of 10 seconds.

The application uses `AbortSignal.timeout()` to create a timeout signal and `AbortSignal.any()` to combine it with the user-input cancellation signal.

This allows the application to distinguish between:

- User cancellation: the request is ignored.
- Timeout: an error message is displayed and the user can retry.

## 5. Error Handling

The application handles several error scenarios:

- HTTP 404: returns an empty array and displays a no-results message.
- Other HTTP errors: throws a custom `HttpError`.
- Network errors: displays an error message.
- Timeout errors: displays a timeout message.
- User-triggered cancellation: does not display an error.

A Retry button allows the user to repeat the last failed search.

## 6. Data Mapping

The API response is transformed by `mapCountryResponse()` into a structure used by the interface.

The mapper extracts:

- Country name
- Flag
- Capital
- Region
- Population
- Languages

The API response contains languages as objects. The mapper converts them into an array of strings.

The mapping function is independent of the DOM, which makes it easier to test and reuse.

## 7. DOM and Rendering

The application creates DOM elements using native JavaScript methods such as `document.createElement()`, `append()`, `textContent`, and `replaceChildren()`.

It does not use `innerHTML` or `insertAdjacentHTML`.

This approach keeps rendering separate from API logic and avoids inserting untrusted API content as HTML.

Country details are displayed on demand using a button on each card.

## 8. Complexity Analysis

Let:

- n be the number of countries returned by the API.
- m be the total number of language entries across all returned countries.

| Operation                 | Time complexity                    |
| ------------------------- | ---------------------------------- |
| Debounce invocation       | O(1)                               |
| Mapping country data      | O(n + m)                           |
| Rendering country cards   | O(n + m)                           |
| Clearing previous results | O(n) in terms of removed DOM nodes |

The API response time depends on network conditions and server performance, so it is not included in the local algorithmic complexity analysis.

## 9. Code Quality

The project follows these principles:

- TypeScript strict mode is enabled.
- API logic, data mapping, utility functions, and UI logic are separated.
- Functions have focused responsibilities.
- Type definitions describe API and application data.
- Tests are written with Vitest.
- ESLint and Prettier are used for code quality and formatting.
