# Indian Colleges API

A simple local API to get a list of Indian colleges, filterable by state and district.
Data source: [VarthanV/Indian-Colleges-List](https://github.com/VarthanV/Indian-Colleges-List)

## Setup

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Start the server:
    ```bash
    node index.js
    ```
    The server will start on **http://localhost:3001**.
    (It may take a few seconds to fetch the data on first start).

## API Endpoints

### 1. Get All States
Returns a list of all available states.
-   **URL:** `GET /states`
-   **Example:** `http://localhost:3001/states`

### 2. Get Colleges by State (New!)
Returns all colleges for a specific state.
-   **URL:** `GET /states/:stateName`
-   **Example:** `http://localhost:3001/states/Karnataka`

### 3. View as PDF / List (New!)
Returns a styled HTML page suitable for printing or saving as PDF.
-   **URL:** `GET /view/states/:stateName`
-   **Example:** `http://localhost:3001/view/states/Karnataka`

### 4. Get Colleges (Advanced Filter)
Returns a paginated list of colleges.
-   **URL:** `GET /colleges`
-   **Query Parameters:**
    -   `state`: Filter by state name (e.g., `Karnataka`)
    -   `district`: Filter by district (e.g., `Bangalore`)
    -   `search`: Search by college name (e.g., `Engineering`)
    -   `page`: Page number (default: 1)
    -   `limit`: Items per page (default: 20)

-   **Examples:**
    -   Get colleges in Karnataka:
        `http://localhost:3001/colleges?state=Karnataka`
    -   Search for IITs:
        `http://localhost:3001/colleges?search=IIT`
