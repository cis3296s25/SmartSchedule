# Smart Schedule

SmartSchedule is a web-based course scheduling tool for Temple University students that generates optimal, conflict-free schedules based on selected courses and personal time restrictions like work hours. It uses web scraping to pull real-time course data from Temple’s registration system, ensuring up-to-date information. Users can view all valid schedule combinations and access direct links to Rate My Professors and Temple’s registration portal for a seamless registration experience.

<br/>

<img src="https://github.com/user-attachments/assets/5c4aa925-f032-4370-88d4-c2e3550f6ce7" alt="Alt Text" width="850" height="400">


---
Site URL: https://cis3296s25.github.io/SmartSchedule/ 

---
## How to run

Requirements:
- Node.js
    - npm (bundled with Node.js)
- Python
    - pip (bundled with Python) 
  
## Front End

Dependencies:
- React/ReactDOM + Vite
- axios
- html2canvas
- jspdf

1. In project directory, install all dependencies: 
    ```
    npm install
    ```
      
2. Start local development server
   ```
    npm run dev
    ```

## Back End

Dependencies:
- FastAPI
- uvicorn
- requests
- beautifulsoup4

1. In a new terminal, navigate to the backend folder 
    ```
    cd backend
    ```
    
2. From here, install dependencies
    ```
    pip install -r requirements.txt
    ```
3. Start the server using 
    ```
    uvicorn main:app --reload --port 8000
    ```
   - `--reload`: Enables hot-reloading 
   - `--port 8000`: Server will run at `http://localhost:8000`

---

## Troubleshooting

- Use a virtual environment (recommended)
  
    1. Create and activate a virtual environment inside the project folder
        ```
        python -m venv venv
        source venv/bin/activate      # Mac/Linux
        venv\Scripts\activate         # Windows
        ```
    2. Install the dependencies inside the virtual environment
       ```
        pip install -r requirements.txt
       ```
       
- If you encounter errors like "module not found" for packages such as axios, react, or others:
  
    1. Try manually installing the missing package:

        ```
        npm install <package-name>
        // example for axios: npm install axios
        ```
- API testing in Swagger
  
    1. After starting the backend server using 

        ```
        uvicorn main:app --reload --port 8000
        ```
    2. APIs can be tested directly at: http://localhost:8000/docs 
       
