# Code Runner microservice

This is help to run the code on docker.

---


## Tech Stack

### Core Technologies:
- ** Node.js and MongoDB**.
- ** Docker**.


##  Installation & Local Setup

> Make sure you have the following installed:
> - Node.js (v16+)
> - Docker
> - Git


### 2. Installing and running process

- **Go to backend/code-runner directory and run npm install. It will install all required dependencies.**
- **Build your Docker image using "docker build -t code-runner ."(Remember . should be included).**
- **Run your Docker container, mapping 5003 on your System using "docker run -p 5003:5000 code-runner" command.**