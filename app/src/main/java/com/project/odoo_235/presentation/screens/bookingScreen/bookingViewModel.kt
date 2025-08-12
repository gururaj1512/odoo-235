package com.project.odoo_235.presentation.screens.bookingScreen

import android.os.Parcelable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.project.odoo_235.data.api.RetrofitInstance.api
import com.project.odoo_235.data.models.BookingDetails
import com.project.odoo_235.data.models.BookingRequest
import com.project.odoo_235.data.models.BookingState
import com.project.odoo_235.data.models.Court

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.time.LocalDate

class BookingViewModel : ViewModel() {

    private val _venueDetail = MutableStateFlow<Court?>(null)
    val venueDetail: StateFlow<Court?> = _venueDetail

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    private val _bookingState = MutableStateFlow<BookingState>(BookingState.Initial)
    val bookingState: StateFlow<BookingState> = _bookingState

    fun fetchVenueDetail(venueId: String) {
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            try {
                val response = api.getCourtById(venueId)  // Implement this API call
                if (response.isSuccessful) {
                    _venueDetail.value = response.body()
                } else {
                    _error.value = "Failed to load venue details: ${response.message()}"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Unknown error"
            }
            _loading.value = false
        }
    }

    fun bookVenue(
        venueId: String,
        selectedDate: LocalDate,
        durationHours: Int,
        pitchSize: String,
        selectedSlot: String,
        paymentViewModel: PaymentViewModel
    ) {
        viewModelScope.launch {
            _bookingState.value = BookingState.Processing
            _error.value = null

            try {
                val isSlotAvailable = checkSlotAvailability(venueId, selectedDate, selectedSlot)

                if (!isSlotAvailable) {
                    _bookingState.value = BookingState.Failed("Selected slot is not available")
                    return@launch
                }

                val amount = paymentViewModel.calculateAmount(durationHours, pitchSize)

                _bookingState.value = BookingState.ReadyForPayment(
                    BookingDetails(
                        venueId = venueId,
                        selectedDate = selectedDate.toString(),
                        durationHours = durationHours,
                        pitchSize = pitchSize,
                        selectedSlot = selectedSlot,
                        amount = amount
                    )
                )
            } catch (e: Exception) {
                _bookingState.value = BookingState.Failed(e.message ?: "Booking failed")
            }
        }
    }


    private val _lastSuccessfulBooking = MutableStateFlow<BookingRequest?>(null)
    val lastSuccessfulBooking: StateFlow<BookingRequest?> = _lastSuccessfulBooking

    // In your bookVenueDirect function, when booking succeeds:
    fun bookVenueDirect(
        venueId: String,
        selectedDate: LocalDate,
        durationHours: Int,
        pitchSize: String,
        selectedSlot: String,
    ) {
        viewModelScope.launch {
            _bookingState.value = BookingState.Processing
            _error.value = null

            try {
                val amount = calculateAmount(durationHours, pitchSize)
                val bookingRequest = BookingRequest(
                    venueId = venueId,
                    selectedDate = selectedDate.toString(),
                    durationHours = durationHours,
                    pitchSize = pitchSize,
                    selectedSlot = selectedSlot,
                    amount = amount,
                    paymentId = ""
                )
                val response = api.createBooking(bookingRequest)

                if (response.isSuccessful) {
                    _lastSuccessfulBooking.value = bookingRequest  // Save here
                    _bookingState.value = BookingState.Success(bookingRequest)
                } else {
                    _bookingState.value = BookingState.Failed("Booking failed: ${response.message()}")
                }
            } catch (e: Exception) {
                _bookingState.value = BookingState.Failed(e.message ?: "Booking failed")
            }
        }
    }


    private suspend fun checkSlotAvailability(venueId: String, date: LocalDate, slot: String): Boolean {
        // TODO: Replace with actual API call
        return true
    }


}



// Utility function (you can move it elsewhere if needed)
fun calculateAmount(durationHours: Int, pitchSize: String): Double {
    val baseRatePerHour = when (pitchSize) {
        "5 x 5" -> 500.0
        "7 x 7" -> 800.0
        "10 x 10" -> 1200.0
        else -> 500.0
    }
    return baseRatePerHour * durationHours
}
