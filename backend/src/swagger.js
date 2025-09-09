import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My Express API",
      version: "1.0.0",
      description: "API documentation for my Express project",
    },
    servers: [
      {
        url: "http://localhost:3005",
      },
    ],
    components: {
      schemas: {
        CustomerSignupRequest: {
          type: "object",
          required: ["name", "email", "phone_number", "address", "username", "password"],
          properties: {
            name: { type: "string", example: "John Doe" },
            email: { type: "string", format: "email", example: "john@example.com" },
            phone_number: { type: "string", example: "9876543210" },
            address: { type: "string", example: "New York, USA" },
            username: { type: "string", example: "johndoe" },
            password: { type: "string", format: "password", example: "secret123" },
          },
        },
        CustomerResponse: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            phone_number: { type: "string", example: "9876543210" },
            address: { type: "string", example: "New York, USA" },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};


const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app, port) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
}

export default swaggerDocs;
