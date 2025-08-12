package com.project.odoo_235.data.api

import com.project.odoo_235.data.models.*
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Headers
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query
import retrofit2.http.Url

interface Repo {
    @POST("api/v1/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<LoginResponse>
    @POST("api/v1/register")
    suspend fun signup(@Body request: SignUpRequest): Response<SignUpResponse>





    @POST("/api/v1/email/send-verification-email")
    suspend fun sendOtp(@Body request: OtpRequest): Response<LoginResponse>

    @POST("/api/v1/email/verify-otp")
    suspend fun verifyOtp(@Body request: OtpRequest): Response<LoginResponse>
    @POST("/api/court/by-city")
    suspend fun getCourtsByCity(@Body request: CityRequest): Response<CourtsResponse>
    @POST("/api/booking")
    suspend fun createBooking(@Body request: BookingRequest): Response<BookingResponse>



    @GET("/api/court/{id}")
    suspend fun getCourtById(
        @Path("id") courtId: String
    ): Response<Court>


    @POST("/api/court/by-venue")
    suspend fun getCourtsByVenueId(
        @Body venueIdRequest: VenueIdRequest
    ): Response<List<Court>>

    @POST("/api/booking/by-venue")
    suspend fun getBookingByVenueId(
        @Body venueIdRequest: VenueIdRequest
    ): Response<List<BookingRequest>>


    @POST("/api/court/createcourt")
    suspend fun createCourt(@Body courtRequest: CourtRequest): Response<CourtResponse>
    @GET("/api/court/getall")
    suspend fun getAllCourts(): Response<CourtsResponse>

}


