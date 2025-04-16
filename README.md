
## Front End

---
Site URL: https://cis3296s25.github.io/01-SmartSchedule/ 

### Requirements

- Node.js
- npm (Node package manager)

---
### How to run 

1. In project directory, run: 
    ```
    npm install
    ```
    ```
    npm install axios
    ```
    ```
    npm install jspdf
    ```
    ```
    npm install html2canvas
    ```
2. Start local development server: 
    ```
    npm run dev
    ```
3. Wait up to 5 minutes for the courses to succesfully load onto the screen.

4. Open an additional terminal to run the backend.
 
---


## Backend


---

### Requirements


- Python 3.9+
- pip (Python package manager)

---

### How to run 

1. In the second terminal, navigate to the backend directory:
   ```
   cd backend
   ```
3. In the backend directory, run: 
    ```
    pip install -r requirements.txt
    ```
   
   - Pip will install all backend dependencies required for this application.


4. Start the server using 
    ```
    uvicorn main:app --reload --port 8000
    ```
   - `--reload`: Enables hot-reloading 
   - `--port 8000`: Server will run at `http://localhost:8000`


---

### API Endpoints

Once the server is running, you can test these endpoints in your browser. 

If using a port different from 8000, be sure to replace 8000 with your port.



###  Root
- Confirms the server is running  
- **GET** [`http://localhost:8000/`](http://localhost:8000/)


###  All Subjects (Hardcoded for now)  
- **GET** [`http://localhost:8000/api/subjects`](http://localhost:8001/api/subjects)



###  All Courses for a Subject  
- **GET** `/api/subject/courses?subject=<SUBJECT>&term_code=<TERM_CODE>`

- **Example**: [`http://localhost:8000/api/courses?subject=CIS&term_code=202503`](http://localhost:8001/api/courses?subject=CIS&term_code=202503)


###  All Courses for All Subjects  

- **GET** `/api/all-courses?term_code=<TERM_CODE>`

- **Example**: [`http://localhost:8000/api/all-courses?term_code=202503`](http://localhost:8001/api/all-courses?term_code=202503)

---

### Swagger UI 
You can also test all APIs in this interactive UI: [`http://localhost:8000/docs`](http://localhost:8000/docs)

---
