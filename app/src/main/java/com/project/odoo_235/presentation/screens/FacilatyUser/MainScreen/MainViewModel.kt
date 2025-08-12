package com.project.odoo_235.presentation.screens.FacilatyUser.MainScreen


import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.project.odoo_235.data.api.RetrofitInstance.api
import com.project.odoo_235.data.datastore.UserSessionManager
import com.project.odoo_235.data.models.BookingRequest
import com.project.odoo_235.data.models.BookingResponse
import com.project.odoo_235.data.models.Court
import com.project.odoo_235.data.models.VenueIdRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.flow.combine

class FacilityDashboardViewModel : ViewModel() {

    private val _courts = MutableStateFlow<List<Court>>(emptyList())
    val courts: StateFlow<List<Court>> = _courts

    private val _bookings = MutableStateFlow<List<BookingRequest>>(emptyList())
    val bookings: StateFlow<List<BookingRequest>> = _bookings

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    // Analytics
    private val _totalCourts = MutableStateFlow(0)
    val totalCourts: StateFlow<Int> = _totalCourts

    private val _totalBookings = MutableStateFlow(0)
    val totalBookings: StateFlow<Int> = _totalBookings

    private val _totalEarnings = MutableStateFlow(0.0)
    val totalEarnings: StateFlow<Double> = _totalEarnings

    init {
        // Combine courts and bookings to compute analytics whenever either changes
        viewModelScope.launch {
            combine(_courts, _bookings) { courts, bookings ->
                Triple(
                    courts.size,
                    bookings.size,
                    bookings.sumOf { it.amount }
                )
            }.collect { (courtsCount, bookingsCount, earnings) ->
                _totalCourts.value = courtsCount
                _totalBookings.value = bookingsCount
                _totalEarnings.value = earnings
            }
        }
    }

    fun fetchUserCourts(user: String) {
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            try {
                val venueId = user
                if (venueId.isBlank()) {
                    _error.value = "User ID not found"
                    _loading.value = false
                    return@launch
                }
                val response = api.getCourtsByVenueId(VenueIdRequest(venueId))
                if (response.isSuccessful) {
                    _courts.value = response.body() ?: emptyList()
                } else {
                    _error.value = "Failed to fetch courts: ${response.message()}"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Unknown error"
            }
            _loading.value = false
        }
    }

    fun fetchUserBooking(user: String) {
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            try {
                val venueId = user
                if (venueId.isBlank()) {
                    _error.value = "User ID not found"
                    _loading.value = false
                    return@launch
                }
                Log.d("FacilityDashboardViewModel", "Fetching bookings for venue ID: $venueId")
                val response = api.getBookingByVenueId(VenueIdRequest(venueId))
                Log.d("FacilityDashboardViewModel", "Response: $response")
                if (response.isSuccessful) {
                    _bookings.value = response.body() ?: emptyList()
                } else {
                    _error.value = "Failed to fetch bookings: ${response.message()}"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Unknown error"
            }
            _loading.value = false
        }
    }

    private val _bookingTrends = MutableStateFlow<List<BookingTrend>>(emptyList())
    val bookingTrends: StateFlow<List<BookingTrend>> = _bookingTrends

    private val _earningsSummary = MutableStateFlow<List<EarningsSummary>>(emptyList())
    val earningsSummary: StateFlow<List<EarningsSummary>> = _earningsSummary

    private val _peakBookingHours = MutableStateFlow<List<HourlyBooking>>(emptyList())
    val peakBookingHours: StateFlow<List<HourlyBooking>> = _peakBookingHours

    fun processAnalytics(bookings: List<BookingRequest>) {
        // Example aggregation for daily booking trends (group by date)
        val dailyBookings = bookings.groupingBy { it.selectedDate }
            .eachCount()
            .map { BookingTrend(it.key, it.value) }
            .sortedBy { it.label }

        _bookingTrends.value = dailyBookings

        // Earnings summary by date
        val earnings = bookings.groupBy { it.selectedDate }
            .map {
                val total = it.value.sumOf { booking -> booking.amount }
                EarningsSummary(it.key, total)
            }
            .sortedBy { it.label }

        _earningsSummary.value = earnings

        // Peak booking hours
        val hoursCount = bookings.groupingBy { booking ->
            // Extract hour from selectedSlot, example: "10:00 AM - 12:00 PM"
            // You might want to parse this properly depending on your slot format
            booking.selectedSlot.takeWhile { it.isDigit() }.toIntOrNull() ?: 0
        }.eachCount()
            .map { HourlyBooking(it.key, it.value) }
            .sortedBy { it.hour }

        _peakBookingHours.value = hoursCount
    }
}
