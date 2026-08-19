using AppPortal.Api.Data;
using AppPortal.Api.Services;
using AppPortal.Api.Integrations.ExternalPayment;
using AppPortal.Api.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using Serilog;
using System.Data;
using Serilog.Sinks.MSSqlServer;
using Serilog.Debugging;
using Microsoft.OpenApi;


SelfLog.Enable(message =>
{
    Console.Error.WriteLine($"SERILOG ERROR: {message}");
});

var builder = WebApplication.CreateBuilder(args);

var columnOptions = new ColumnOptions();

columnOptions.Store.Clear();

columnOptions.Store.Add(StandardColumn.TimeStamp);
columnOptions.Store.Add(StandardColumn.Level);
columnOptions.Store.Add(StandardColumn.Message);
columnOptions.Store.Add(StandardColumn.Exception);
columnOptions.Store.Remove(StandardColumn.Properties);

// Map Serilog's TimeStamp column to the existing SQL column "Timestamp"
columnOptions.TimeStamp.ColumnName = "Timestamp";

columnOptions.AdditionalColumns = new List<SqlColumn>
{
    new SqlColumn
    {
        ColumnName = "SourceContext",
        PropertyName = "SourceContext",
        DataType = SqlDbType.NVarChar,
        DataLength = 255,
        AllowNull = true
    },

    new SqlColumn
    {
        ColumnName = "RequestPath",
        PropertyName = "RequestPath",
        DataType = SqlDbType.NVarChar,
        DataLength = 500,
        AllowNull = true
    },

    new SqlColumn
    {
        ColumnName = "HttpMethod",
        PropertyName = "HttpMethod",
        DataType = SqlDbType.NVarChar,
        DataLength = 20,
        AllowNull = true
    },

    new SqlColumn
    {
        ColumnName = "StatusCode",
        PropertyName = "StatusCode",
        DataType = SqlDbType.Int,
        AllowNull = true
    },

    new SqlColumn
    {
        ColumnName = "CustomerId",
        PropertyName = "CustomerId",
        DataType = SqlDbType.Int,
        AllowNull = true
    },

    new SqlColumn
    {
        ColumnName = "LoanAccountId",
        PropertyName = "LoanAccountId",
        DataType = SqlDbType.Int,
        AllowNull = true
    },

    new SqlColumn
    {
        ColumnName = "PaymentId",
        PropertyName = "PaymentId",
        DataType = SqlDbType.Int,
        AllowNull = true
    },

    new SqlColumn
    {
        ColumnName = "TransactionId",
        PropertyName = "TransactionId",
        DataType = SqlDbType.NVarChar,
        DataLength = 100,
        AllowNull = true
    },

    new SqlColumn
    {
        ColumnName = "CorrelationId",
        PropertyName = "CorrelationId",
        DataType = SqlDbType.NVarChar,
        DataLength = 100,
        AllowNull = true
    }
};

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .WriteTo.MSSqlServer(
        connectionString:
            builder.Configuration.GetConnectionString("DefaultConnection"),
        sinkOptions: new MSSqlServerSinkOptions
        {
            TableName = "ApplicationLogs",
            AutoCreateSqlTable = false
        },
        columnOptions: columnOptions)
    .CreateLogger();

builder.Host.UseSerilog();

// Register services
builder.Services.AddControllers();
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token. Example: Bearer {token}"
    });

    options.AddSecurityRequirement(document =>
        new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference("Bearer", document)] = []
        });
});


// Register EF Core
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));
        
// Register your services
builder.Services.AddScoped<RegistrationService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IJwtService, JWTService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<AccountService>();
builder.Services.Configure<ExternalApiSettings>(
    builder.Configuration.GetSection("ExternalApi"));

builder.Services.AddHttpClient<IExternalPaymentService, ExternalPaymentService>(
    (serviceProvider, client) =>
    {
        var settings =
            serviceProvider
                .GetRequiredService<IOptions<ExternalApiSettings>>()
                .Value;

        client.BaseAddress = new Uri(settings.BaseUrl);
    });
    
// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// JWT Authentication
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            builder.Configuration["Jwt:Key"]!))
            };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Pipeline
// if (app.Environment.IsDevelopment())
// {
    app.UseSwagger();
    app.UseSwaggerUI();
// }


// CORS should be before authentication/authorization
app.UseCors("ReactApp");
app.UseSerilogRequestLogging();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();