package com.project.odoo_235.presentation.screens.MianScreen

import android.Manifest


import android.annotation.SuppressLint
import android.app.Application
import android.content.Context
import android.location.Geocoder
import android.location.Location
import android.os.Looper
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.project.odoo_235.data.api.RetrofitInstance.api
import com.project.odoo_235.data.models.CityRequest
import com.project.odoo_235.data.models.Court
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import java.util.Locale
import kotlin.coroutines.resume

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val _currentCity = MutableStateFlow("")
    val currentCity: StateFlow<String> = _currentCity

    @SuppressLint("MissingPermission")
    fun fetchCurrentCity(context: Context) {
        _currentCity.value="Gandhinagar"
//        viewModelScope.launch(Dispatchers.IO) {
//            try {
//                Log.d("LocationVM", "Fetching current city...")
//
//                val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)
//
//                val location = suspendCancellableCoroutine<Location?> { cont ->
//                    fusedLocationClient.lastLocation
//                        .addOnSuccessListener { loc ->
//                            if (loc != null) {
//                                Log.d("LocationVM", "Last known location: ${loc.latitude}, ${loc.longitude}")
//                                cont.resume(loc)
//                            } else {
//                                Log.d("LocationVM", "No last location found, requesting fresh location...")
//                                val request = LocationRequest.Builder(
//                                    Priority.PRIORITY_HIGH_ACCURACY, 2000
//                                ).setMaxUpdates(1).build()
//
//                                fusedLocationClient.requestLocationUpdates(
//                                    request,
//                                    object : LocationCallback() {
//                                        override fun onLocationResult(result: LocationResult) {
//                                            fusedLocationClient.removeLocationUpdates(this)
//                                            val freshLoc = result.lastLocation
//                                            if (freshLoc != null) {
//                                                Log.d("LocationVM", "Fresh location: ${freshLoc.latitude}, ${freshLoc.longitude}")
//                                            } else {
//                                                Log.d("LocationVM", "Fresh location request failed.")
//                                            }
//                                            cont.resume(freshLoc)
//                                        }
//                                    },
//                                    Looper.getMainLooper()
//                                )
//                            }
//                        }
//                        .addOnFailureListener { e ->
//                            Log.e("LocationVM", "Error getting last location: ${e.message}")
//                            cont.resume(null)
//                        }
//                }
//
//                if (location != null) {
//                    Log.d("LocationVM", "Getting address from Geocoder...")
//                    val geocoder = Geocoder(context, Locale.getDefault())
//                    val addressList = geocoder.getFromLocation(location.latitude, location.longitude, 1)
//
//                    if (!addressList.isNullOrEmpty()) {
//                        val city = addressList[0].locality ?: addressList[0].subAdminArea ?: "Unknown City"
//                        Log.d("LocationVM", "City resolved: $city")
//                        _currentCity.value = city
//                    } else {
//                        Log.d("LocationVM", "Geocoder returned empty list.")
//                        _currentCity.value = "Unknown City"
//                    }
//                } else {
//                    Log.d("LocationVM", "Location is null, cannot fetch city.")
//                    _currentCity.value = "Location Unavailable"
//                }
//            } catch (e: Exception) {
//                Log.e("LocationVM", "Exception while fetching location: ${e.message}")
//                e.printStackTrace()
//                _currentCity.value = "Error fetching location"
//            }
//        }
    }


    private val _courts = MutableStateFlow<List<Court>>(emptyList())
    val courts: StateFlow<List<Court>> = _courts

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error


    fun fetchCourts() {
        viewModelScope.launch {
            _loading.value = true
            _error.value = null

            try {
                val response = api.getAllCourts()  // Change here to call API for all courts

                Log.d("CourtViewModel", "API Response Code: ${response.code()}")
                Log.d("CourtViewModel", "API Response Message: ${response.message()}")

                if (response.isSuccessful && response.body() != null) {
                    Log.d("CourtViewModel", "Successfully fetched courts: ${response.body()!!.courts.size} courts found.")
                    _courts.value = response.body()!!.courts
                } else {
                    _error.value = response.message()
                    Log.e("CourtViewModel", "Failed to fetch courts: ${response.message()}")
                }
            } catch (e: Exception) {
                _error.value = e.localizedMessage
                Log.e("CourtViewModel", "Error fetching courts", e)
            } finally {
                _loading.value = false
                Log.d("CourtViewModel", "Fetch courts process completed.")
            }
        }
    }





}


