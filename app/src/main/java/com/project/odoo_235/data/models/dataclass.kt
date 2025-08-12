package com.project.odoo_235.data.models

import com.google.android.gms.maps.model.LatLng
import com.google.gson.annotations.SerializedName

import kotlinx.serialization.Serializable


data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val success: Boolean,
    val token: String? = null,
    val message: String? = null,
    val user: User? = null
)


data class SignUpRequest(
    val name: String,
    val email: String,
    val password: String,
    val age: Int,
     val role: String,
    val phone: String
)

data class User(
    val _id: String = "",
    val name: String,
    val username: String = "",
    val email: String= "",
    val password: String = "",
    val gender: String = "",
    val age: Int = 0,
    val college: String = "",
    val graduationYear: Int = 0,
    val branch: String = "",
    val skills: List<String> = emptyList(),
    val bio: String = "",
    val githubProfile: String = "",
    val linkedin: String = "",
    val avatar: Avatar? = null,
    val resume: String = "",
    val myFeed: List<String> = emptyList(),
    val role: String = "",
    val createdAt: String = ""
)


data class SignUpResponse(
    val success: Boolean,
    val message: String? = null,
    val token: String? = null,
    val user: User? = null
)

data class CourtsResponse(
    val success: Boolean,
    val count: Int,
    val courts: List<Court>
)

data class Court(
    val actions: Actions,
    val _id: String,
    val venueId: String,
    val venueName: String,
    val sportType: String,
    val courtName: String,
    val city: String,
    val availableDate: String,
    val availableTime: String,
    val status: String
)

data class Actions(
    val canBook: Boolean
)





@Serializable
data class Applicant(
    val _id: String,
    val postId: String,
    val applicantId: ApplicantUser,
    val message: String = "",
    val status: String,
    val appliedAt: String
)

@Serializable
data class ApplicantUser(
    val _id: String,
    val name: String,
    val email: String,
    val avatar: Avatar?
)

@Serializable
data class Avatar(
    val public_id : String,
    val url: String
)

data class GenericResponse(
    val success: Boolean,
    val message: String,
    val application: Applicant?
)


data class UidRequest(
    val uid: String
)

data class UserIdResponse(
    val success: Boolean,
    val userId: String
)

data class OtpRequest(
    val email: String,
    val otp : String = ""
)


data class CityRequest(
    val city: String
)



data class CourtAvailability(
    val courtId: String,
    val date: String,
    val timeSlots: List<TimeSlot>,
    val lastUpdated: Long
)

data class TimeSlot(
    val startTime: String,
    val endTime: String,
    val isAvailable: Boolean,
    val price: Double,
    val bookingId: String? = null
)

enum class AvailabilityStatus(val displayText: String, val color: androidx.compose.ui.graphics.Color) {
    AVAILABLE("Available Now", androidx.compose.ui.graphics.Color(0xFF4CAF50)),
    BUSY("Busy", androidx.compose.ui.graphics.Color(0xFFFF9800)),
    CLOSED("Closed", androidx.compose.ui.graphics.Color(0xFFF44336)),
    BOOKING_REQUIRED("Booking Required", androidx.compose.ui.graphics.Color(0xFF2196F3))
}

data class PriceRange(
    val min: Double,
    val max: Double,
    val currency: String = "₹"
)

data class ContactInfo(
    val phone: String?,
    val email: String?,
    val website: String?
)

data class OpeningHours(
    val monday: String,
    val tuesday: String,
    val wednesday: String,
    val thursday: String,
    val friday: String,
    val saturday: String,
    val sunday: String
)


data class SportsVenue(
    val name: String,
    val location: LatLng,
    val type: String // e.g., "cricket", "turf", etc.
)
data class BookingResponse(
    val message: String,
    val booking: BookingRequest
)


data class CourtRequest(
    val venueId: String,
    val venueName: String,
    val sportType: String,
    val courtName: String,
    val city: String,
    val availableDate: String,
    val availableTime: String,
    val status: String = "Available",
    val actions: Actions= Actions(true)
)



data class CourtResponse(
    val message: String,
    val court: CourtRequest // You can adjust if backend sends full court object
)


// Data classes for booking
@kotlinx.serialization.Serializable
data class BookingDetails(
    val venueId: String,
    val selectedDate: String,  // e.g. "2025-08-11"
    val durationHours: Int,
    val pitchSize: String,
    val selectedSlot: String,
    val amount: Double
)


@kotlinx.serialization.Serializable
data class BookingRequest(
    val venueId: String,
    val selectedDate: String,
    val durationHours: Int,
    val pitchSize: String,
    val selectedSlot: String,
    val amount: Double,
    val paymentId: String
)
// Sealed class for booking states
sealed class BookingState {
    object Initial : BookingState()
    object Processing : BookingState()
    data class ReadyForPayment(val bookingDetails: BookingDetails) : BookingState()
    data class Success(val booking: BookingRequest) : BookingState()
    data class Failed(val error: String) : BookingState()
}

data class VenueIdRequest(val venueId: String)