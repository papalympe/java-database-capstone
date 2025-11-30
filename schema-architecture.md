# Application Architecture Documentation

## Section 1: Architecture Summary

This Spring Boot application combines MVC and REST architecture to manage hospital operations. The Admin and Doctor dashboards are implemented using Thymeleaf templates for server-side rendering, while all other modules, including patient interactions and prescription management, are exposed through REST APIs. 

The application interacts with two databases: MySQL stores structured data such as patients, doctors, appointments, and admin details, while MongoDB handles unstructured data, specifically prescriptions. All incoming requests pass through a centralized service layer, which encapsulates business logic and delegates database operations to the appropriate repositories. MySQL operations leverage JPA entities for object-relational mapping, whereas MongoDB utilizes document models for flexible data storage.

This design ensures separation of concerns, scalability, and efficient handling of both relational and document-based data.

## Section 2: Numbered Flow of Data and Control

1. The user initiates an action by accessing the AdminDashboard, DoctorDashboard, or any REST API endpoint.  
2. The request is routed to the appropriate controller—Thymeleaf controllers for dashboard views and REST controllers for API calls.  
3. The controller validates the request and invokes the corresponding method in the service layer.  
4. The service layer processes business logic, including any necessary data transformations or checks.  
5. The service layer communicates with the relevant repository depending on the type of data (MySQL via JPA repositories or MongoDB via document repositories).  
6. The repository executes the database operations (CRUD) and returns the results to the service layer.  
7. The service layer sends the processed data back to the controller, which then returns a response to the user (HTML view for dashboards or JSON response for APIs).  
