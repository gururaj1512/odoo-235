
package com.project.odoo_235.presentation.screens.bookingScreen

import android.content.Context
import android.os.Build
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.project.odoo_235.data.datastore.UserSessionManager
import com.project.odoo_235.data.models.BookingState
import kotlinx.coroutines.delay


@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun VenueScreen(
    venueId: String,
    venueViewModel: BookingViewModel ,
    onNavigateToSuccess: () -> Unit,  // no bookingRequest param here
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val venue by venueViewModel.venueDetail.collectAsState()
    val loading by venueViewModel.loading.collectAsState()
    val error by venueViewModel.error.collectAsState()
    val bookingState by venueViewModel.bookingState.collectAsState()
    var vd by remember { mutableStateOf("") }
    val sessionManager = remember { UserSessionManager(context) }


    val cachedUser by sessionManager.userData.collectAsState(initial = null)
    LaunchedEffect(cachedUser) {
        cachedUser?.let {
            vd = it.id
        }
    }

    LaunchedEffect(venueId) {
        venueViewModel.fetchVenueDetail(venueId)
    }

    LaunchedEffect(bookingState) {
        when (bookingState) {
            is BookingState.Success -> {
                onNavigateToSuccess() // just navigate without data
            }
            is BookingState.Failed -> {
                Toast.makeText(context, "Booking Failed: ${(bookingState as BookingState.Failed).error}", Toast.LENGTH_SHORT).show()
            }
            else -> { }
        }
    }

    Surface(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        when {
            loading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
            error != null -> {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(text = "Error: $error", color = MaterialTheme.colorScheme.error)
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(onClick = onNavigateBack) {
                        Text("Go Back")
                    }
                }
            }
            venue != null -> {
                BookingScreen(
                    venue = venue!!,
                    onProceedClick = { selectedDate, durationHours, pitchSize, selectedSlot ->

                        venueViewModel.bookVenueDirect(
                            venueId = venue!!.venueId,
                            selectedDate = selectedDate,
                            durationHours = durationHours,
                            pitchSize = pitchSize,
                            selectedSlot = selectedSlot
                        )
                    }
                )
            }
            else -> {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(text = "Venue not found")
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(onClick = onNavigateBack) {
                        Text("Go Back")
                    }
                }
            }
        }
    }
}



