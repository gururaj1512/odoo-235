package com.project.odoo_235.presentation.screens.FacilatyUser.create

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.project.odoo_235.data.api.RetrofitInstance.api
import com.project.odoo_235.data.models.CourtRequest
import com.project.odoo_235.data.models.CourtResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import retrofit2.Response

class CreateCourtViewModel: ViewModel() {

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    private val _successMessage = MutableStateFlow<String?>(null)
    val successMessage: StateFlow<String?> = _successMessage

    fun createCourt(courtRequest: CourtRequest) {
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            _successMessage.value = null
            try {
                val response: Response<CourtResponse> = api.createCourt(courtRequest)
                if (response.isSuccessful && response.body() != null) {
                    _successMessage.value = response.body()!!.message
                } else {
                    _error.value = "Failed to create court: ${response.message()}"
                }
            } catch (e: Exception) {
                _error.value = "Exception: ${e.localizedMessage}"
            }
            _loading.value = false
        }
    }
}
