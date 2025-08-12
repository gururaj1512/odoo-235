package com.project.odoo_235.presentation.screens.bookingScreen

import android.os.Build
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.annotation.RequiresApi
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.project.odoo_235.data.models.Court
import com.project.odoo_235.ui.theme.AppColors
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.TextStyle
import java.util.*

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun BookingScreen(
    venue: Court,
    onProceedClick: (selectedDate: LocalDate, durationHours: Int, pitchSize: String, selectedSlot: String) -> Unit,
    onBackPressed: (() -> Unit)? = null
) {
    val context = LocalContext.current
    val activity = context as ComponentActivity

    val paymentViewModel: PaymentViewModel = viewModel()
    val paymentStatus by paymentViewModel.paymentStatus.collectAsState()

    LaunchedEffect(paymentStatus) {
        when (val status = paymentStatus) {
            is PaymentStatus.Success -> {
                Toast.makeText(context, "Payment Successful!", Toast.LENGTH_SHORT).show()
            }
            is PaymentStatus.Failed -> {
                Toast.makeText(context, "Payment Failed: ${status.errorMessage}", Toast.LENGTH_SHORT).show()
            }
            PaymentStatus.Initial -> {
            }
            else -> {}
        }
    }
    var selectedDate by remember { mutableStateOf(LocalDate.now()) }
    var durationHours by remember { mutableStateOf(1) }
    var selectedPitch by remember { mutableStateOf("5 x 5") }
    var selectedSlot by remember { mutableStateOf<String?>(null) }

    val slots = listOf(
        "9:00 AM - 10:00 AM",
        "11:00 AM - 12:00 PM",
        "12:30 PM - 1:30 PM",
        "2:00 PM - 3:00 PM",
        "5:00 PM - 6:00 PM",
        "7:00 PM - 8:00 PM"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AppColors.Background)
    ) {
        // Enhanced Header
        EnhancedBookingHeader(
            courtName = venue.courtName,
            venueName = venue.venueName,
            location = venue.city,
            sportType = venue.sportType,
            onBackPressed = onBackPressed
        )

        // Main Content
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Date Selection Section
            EnhancedDateSelectionSection(
                selectedDate = selectedDate,
                onDateSelected = { selectedDate = it }
            )

            // Duration Selection Section
            EnhancedDurationSection(
                durationHours = durationHours,
                onDurationChanged = { durationHours = it }
            )

            // Pitch Size Section
            EnhancedPitchSizeSection(
                selectedPitch = selectedPitch,
                onPitchSelected = { selectedPitch = it }
            )

            // Time Slots Section
            EnhancedTimeSlotsSection(
                slots = slots,
                selectedSlot = selectedSlot,
                onSlotSelected = { selectedSlot = it }
            )

            // Booking Summary
            EnhancedBookingSummaryCard(
                courtName = venue.courtName,
                venueName = venue.venueName,
                selectedDate = selectedDate,
                duration = durationHours,
                pitchSize = selectedPitch,
                timeSlot = selectedSlot,
                estimatedPrice = durationHours * 500 // Example pricing
            )

            // Proceed Button
            EnhancedProceedButton(
                enabled = selectedSlot != null,
                onProceed = {
                    selectedSlot?.let {

                        CoroutineScope(Dispatchers.Main).launch {
                            paymentViewModel.initiatePayment(activity)

                            // Delay for 5 seconds
                            delay(5000L)

                            // After delay, call onProceedClick
                            onProceedClick(selectedDate, durationHours, selectedPitch, it)
                        }
                    }
                }
            )

            // Bottom spacing
            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

@Composable
fun EnhancedBookingHeader(
    courtName: String,
    venueName: String,
    location: String,
    sportType: String,
    onBackPressed: (() -> Unit)?
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        shape = RoundedCornerShape(bottomStart = 24.dp, bottomEnd = 24.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            AppColors.Primary,
                            AppColors.PrimaryVariant,
                            AppColors.PrimaryDark
                        )
                    )
                )
                .padding(20.dp)
        ) {
            Column {
                // Top Row with Back Button and Title
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    if (onBackPressed != null) {
                        IconButton(
                            onClick = onBackPressed,
                            modifier = Modifier
                                .background(
                                    AppColors.OnPrimary.copy(alpha = 0.15f),
                                    CircleShape
                                )
                                .size(44.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.ArrowBack,
                                contentDescription = "Back",
                                tint = AppColors.OnPrimary,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Book Your Court",
                            style = MaterialTheme.typography.headlineSmall,
                            color = AppColors.OnPrimary,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Complete your booking details",
                            style = MaterialTheme.typography.bodyMedium,
                            color = AppColors.OnPrimary.copy(alpha = 0.8f)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Court Information Card
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = AppColors.OnPrimary.copy(alpha = 0.15f)
                    ),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .background(AppColors.OnPrimary.copy(alpha = 0.2f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Stadium,
                                contentDescription = null,
                                tint = AppColors.OnPrimary,
                                modifier = Modifier.size(24.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(16.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = venueName,
                                fontWeight = FontWeight.Bold,
                                color = AppColors.OnPrimary,
                                fontSize = 16.sp
                            )
                            Text(
                                text = courtName,
                                color = AppColors.OnPrimary.copy(alpha = 0.9f),
                                fontSize = 14.sp
                            )

                            Spacer(modifier = Modifier.height(4.dp))

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.LocationOn,
                                    contentDescription = null,
                                    tint = AppColors.OnPrimary.copy(alpha = 0.8f),
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = location,
                                    color = AppColors.OnPrimary.copy(alpha = 0.8f),
                                    fontSize = 12.sp
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Icon(
                                    imageVector = Icons.Default.SportsTennis,
                                    contentDescription = null,
                                    tint = AppColors.OnPrimary.copy(alpha = 0.8f),
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = sportType,
                                    color = AppColors.OnPrimary.copy(alpha = 0.8f),
                                    fontSize = 12.sp
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun EnhancedDateSelectionSection(
    selectedDate: LocalDate,
    onDateSelected: (LocalDate) -> Unit
) {
    EnhancedSectionCard(
        title = "Select Date",
        subtitle = "Choose your preferred date",
        icon = Icons.Default.CalendarToday,
        iconColor = AppColors.Info
    ) {
        val scrollState = rememberScrollState()
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(scrollState),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            val today = LocalDate.now()
            val days = (0..13).map { today.plusDays(it.toLong()) } // Show 2 weeks

            days.forEach { date ->
                EnhancedDateCard(
                    date = date,
                    isSelected = date == selectedDate,
                    onClick = { onDateSelected(date) }
                )
            }
        }
    }
}

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun EnhancedDateCard(date: LocalDate, isSelected: Boolean, onClick: () -> Unit) {
    val dayOfWeek = date.dayOfWeek.getDisplayName(TextStyle.SHORT, Locale.getDefault())
    val dayOfMonth = date.dayOfMonth.toString()
    val month = date.month.getDisplayName(TextStyle.SHORT, Locale.getDefault())
    val isToday = date == LocalDate.now()
    val isPast = date.isBefore(LocalDate.now())

    Card(
        modifier = Modifier
            .width(80.dp)
            .clickable(enabled = !isPast) { onClick() }
            .shadow(
                elevation = if (isSelected) 12.dp else 6.dp,
                shape = RoundedCornerShape(20.dp)
            ),
        colors = CardDefaults.cardColors(
            containerColor = when {
                isPast -> AppColors.OnSurfaceVariant.copy(alpha = 0.3f)
                isSelected -> AppColors.Primary
                isToday -> AppColors.Warning.copy(alpha = 0.1f)
                else -> AppColors.Surface
            }
        ),
        shape = RoundedCornerShape(20.dp)
    ) {
        Column(
            modifier = Modifier.padding(vertical = 18.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = dayOfWeek,
                color = when {
                    isPast -> AppColors.OnSurfaceVariant.copy(alpha = 0.5f)
                    isSelected -> AppColors.OnPrimary
                    isToday -> AppColors.Warning
                    else -> AppColors.OnSurfaceVariant
                },
                fontWeight = FontWeight.Medium,
                fontSize = 12.sp
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = dayOfMonth,
                color = when {
                    isPast -> AppColors.OnSurfaceVariant.copy(alpha = 0.5f)
                    isSelected -> AppColors.OnPrimary
                    isToday -> AppColors.Warning
                    else -> AppColors.OnSurface
                },
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp
            )

            Spacer(modifier = Modifier.height(2.dp))

            Text(
                text = month,
                color = when {
                    isPast -> AppColors.OnSurfaceVariant.copy(alpha = 0.5f)
                    isSelected -> AppColors.OnPrimary.copy(alpha = 0.8f)
                    isToday -> AppColors.Warning.copy(alpha = 0.8f)
                    else -> AppColors.OnSurfaceVariant.copy(alpha = 0.7f)
                },
                fontSize = 10.sp
            )

            if (isToday && !isSelected) {
                Spacer(modifier = Modifier.height(6.dp))
                Box(
                    modifier = Modifier
                        .size(6.dp)
                        .background(AppColors.Warning, CircleShape)
                )
            }
        }
    }
}

@Composable
fun EnhancedDurationSection(
    durationHours: Int,
    onDurationChanged: (Int) -> Unit
) {
    EnhancedSectionCard(
        title = "Play Duration",
        subtitle = "How long would you like to play?",
        icon = Icons.Default.Schedule,
        iconColor = AppColors.Success
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Duration",
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.OnSurfaceVariant,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = "₹${durationHours * 500}/total",
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.Primary,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Card(
                colors = CardDefaults.cardColors(containerColor = AppColors.SurfaceVariant),
                shape = RoundedCornerShape(16.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(8.dp)
                ) {
                    IconButton(
                        onClick = { if (durationHours > 1) onDurationChanged(durationHours - 1) },
                        modifier = Modifier
                            .size(40.dp)
                            .background(
                                if (durationHours > 1) AppColors.Primary.copy(0.1f) else Color.Transparent,
                                CircleShape
                            ),
                        enabled = durationHours > 1
                    ) {
                        Icon(
                            Icons.Default.Remove,
                            contentDescription = "Decrease duration",
                            tint = if (durationHours > 1) AppColors.Primary else AppColors.OnSurfaceVariant.copy(0.5f),
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Text(
                        text = "${durationHours}hr",
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp,
                        color = AppColors.OnSurface,
                        modifier = Modifier.padding(horizontal = 20.dp)
                    )

                    IconButton(
                        onClick = { if (durationHours < 5) onDurationChanged(durationHours + 1) },
                        modifier = Modifier
                            .size(40.dp)
                            .background(
                                if (durationHours < 5) AppColors.Primary.copy(0.1f) else Color.Transparent,
                                CircleShape
                            ),
                        enabled = durationHours < 5
                    ) {
                        Icon(
                            Icons.Default.Add,
                            contentDescription = "Increase duration",
                            tint = if (durationHours < 5) AppColors.Primary else AppColors.OnSurfaceVariant.copy(0.5f),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun EnhancedPitchSizeSection(
    selectedPitch: String,
    onPitchSelected: (String) -> Unit
) {
    val pitchOptions = listOf(
        PitchOption("5 x 5", "Small", "Perfect for 2-4 players", "₹400/hr"),
        PitchOption("7 x 7", "Medium", "Great for 4-6 players", "₹500/hr"),
        PitchOption("10 x 10", "Large", "Ideal for 6-10 players", "₹700/hr")
    )

    EnhancedSectionCard(
        title = "Pitch Size",
        subtitle = "Choose the perfect size for your game",
        icon = Icons.Default.PhotoSizeSelectLarge,
        iconColor = AppColors.Warning
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            pitchOptions.forEach { pitch ->
                EnhancedPitchCard(
                    pitch = pitch,
                    isSelected = pitch.size == selectedPitch,
                    onClick = { onPitchSelected(pitch.size) }
                )
            }
        }
    }
}

@Composable
fun EnhancedPitchCard(
    pitch: PitchOption,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .border(
                width = if (isSelected) 2.dp else 0.dp,
                color = if (isSelected) AppColors.Primary else Color.Transparent,
                shape = RoundedCornerShape(16.dp)
            ),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected)
                AppColors.Primary.copy(alpha = 0.08f)
            else
                AppColors.SurfaceVariant
        ),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(if (isSelected) 8.dp else 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(50.dp)
                    .background(
                        if (isSelected) AppColors.Primary.copy(0.2f) else AppColors.OnSurfaceVariant.copy(0.1f),
                        RoundedCornerShape(12.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = pitch.size,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    color = if (isSelected) AppColors.Primary else AppColors.OnSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "${pitch.size} - ${pitch.category}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = if (isSelected) AppColors.Primary else AppColors.OnSurface
                    )
                    Text(
                        text = pitch.price,
                        style = MaterialTheme.typography.bodyMedium,
                        color = if (isSelected) AppColors.Primary else AppColors.OnSurfaceVariant,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = pitch.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.OnSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            if (isSelected) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .background(AppColors.Primary, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = "Selected",
                        tint = AppColors.OnPrimary,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun EnhancedTimeSlotsSection(
    slots: List<String>,
    selectedSlot: String?,
    onSlotSelected: (String) -> Unit
) {
    EnhancedSectionCard(
        title = "Time Slots",
        subtitle = "Select your preferred time",
        icon = Icons.Default.AccessTime,
        iconColor = AppColors.Info
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            slots.chunked(2).forEach { rowSlots ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    rowSlots.forEach { slot ->
                        EnhancedTimeSlotCard(
                            timeSlot = slot,
                            isSelected = slot == selectedSlot,
                            isAvailable = true, // You can add logic to check availability
                            onClick = { onSlotSelected(slot) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                    // Add empty space if odd number of slots in row
                    if (rowSlots.size == 1) {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

@Composable
fun EnhancedTimeSlotCard(
    timeSlot: String,
    isSelected: Boolean,
    isAvailable: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .clickable(enabled = isAvailable) { onClick() }
            .border(
                width = if (isSelected) 2.dp else 0.dp,
                color = if (isSelected) AppColors.Success else Color.Transparent,
                shape = RoundedCornerShape(16.dp)
            ),
        colors = CardDefaults.cardColors(
            containerColor = when {
                !isAvailable -> AppColors.OnSurfaceVariant.copy(alpha = 0.3f)
                isSelected -> AppColors.Success.copy(alpha = 0.1f)
                else -> AppColors.Surface
            }
        ),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(if (isSelected) 8.dp else 4.dp)
    ) {
        Box(
            modifier = Modifier.padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = timeSlot,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                fontSize = 14.sp,
                color = when {
                    !isAvailable -> AppColors.OnSurfaceVariant.copy(alpha = 0.5f)
                    isSelected -> AppColors.Success
                    else -> AppColors.OnSurface
                },
                textAlign = TextAlign.Center
            )
        }

        if (isSelected) {
            Box(
                modifier = Modifier.fillMaxWidth(),
                contentAlignment = Alignment.BottomEnd
            ) {
                Box(
                    modifier = Modifier
                        .padding(8.dp)
                        .size(20.dp)
                        .background(AppColors.Success, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = "Selected",
                        tint = AppColors.OnPrimary,
                        modifier = Modifier.size(12.dp)
                    )
                }
            }
        }
    }
}

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun EnhancedBookingSummaryCard(
    courtName: String,
    venueName: String,
    selectedDate: LocalDate,
    duration: Int,
    pitchSize: String,
    timeSlot: String?,
    estimatedPrice: Int
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(8.dp, RoundedCornerShape(20.dp)),
        colors = CardDefaults.cardColors(containerColor = AppColors.Surface),
        shape = RoundedCornerShape(20.dp)
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Receipt,
                    contentDescription = null,
                    tint = AppColors.Primary,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "Booking Summary",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = AppColors.OnSurface
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            Card(
                colors = CardDefaults.cardColors(containerColor = AppColors.SurfaceVariant),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    EnhancedSummaryRow(
                        icon = Icons.Default.Stadium,
                        label = "Venue",
                        value = venueName
                    )
                    EnhancedSummaryRow(
                        icon = Icons.Default.SportsTennis,
                        label = "Court",
                        value = courtName
                    )
                    EnhancedSummaryRow(
                        icon = Icons.Default.CalendarToday,
                        label = "Date",
                        value = selectedDate.toString()
                    )
                    EnhancedSummaryRow(
                        icon = Icons.Default.Schedule,
                        label = "Duration",
                        value = "${duration}hr"
                    )
                    EnhancedSummaryRow(
                        icon = Icons.Default.PhotoSizeSelectLarge,
                        label = "Pitch Size",
                        value = pitchSize
                    )
                    if (timeSlot != null) {
                        EnhancedSummaryRow(
                            icon = Icons.Default.AccessTime,
                            label = "Time Slot",
                            value = timeSlot
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Divider(color = AppColors.Outline)

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Total Amount",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = AppColors.OnSurface
                    )
                    Text(
                        text = "Including all charges",
                        style = MaterialTheme.typography.bodySmall,
                        color = AppColors.OnSurfaceVariant
                    )
                }

                Text(
                    text = "₹$estimatedPrice",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = AppColors.Primary
                )
            }
        }
    }
}

@Composable
fun EnhancedSummaryRow(
    icon: ImageVector,
    label: String,
    value: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = AppColors.Primary,
            modifier = Modifier.size(18.dp)
        )
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.OnSurfaceVariant,
            modifier = Modifier.weight(1f)
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.OnSurface,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
fun EnhancedProceedButton(
    enabled: Boolean,
    onProceed: () -> Unit
) {
    Button(
        onClick = onProceed,
        enabled = enabled,
        modifier = Modifier
            .fillMaxWidth()
            .height(64.dp)
            .shadow(if (enabled) 12.dp else 0.dp, RoundedCornerShape(20.dp)),
        colors = ButtonDefaults.buttonColors(
            containerColor = AppColors.Primary,
            disabledContainerColor = AppColors.OnSurfaceVariant.copy(alpha = 0.3f)
        ),
        shape = RoundedCornerShape(20.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            AnimatedVisibility(visible = enabled) {
                Icon(
                    imageVector = Icons.Default.Payment,
                    contentDescription = null,
                    tint = AppColors.OnPrimary,
                    modifier = Modifier.size(24.dp)
                )
            }

            if (enabled) {
                Spacer(modifier = Modifier.width(12.dp))
            }

            Text(
                text = if (enabled) "Proceed to Payment" else "Please select a time slot",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = if (enabled) AppColors.OnPrimary else AppColors.OnSurfaceVariant.copy(alpha = 0.7f)
            )
        }
    }
}

@Composable
fun EnhancedSectionCard(
    title: String,
    subtitle: String,
    icon: ImageVector,
    iconColor: Color,
    content: @Composable () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(6.dp, RoundedCornerShape(20.dp)),
        colors = CardDefaults.cardColors(containerColor = AppColors.Surface),
        shape = RoundedCornerShape(20.dp)
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 20.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .background(iconColor.copy(alpha = 0.1f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = iconColor,
                        modifier = Modifier.size(24.dp)
                    )
                }

                Spacer(modifier = Modifier.width(16.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = AppColors.OnSurface
                    )
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.bodySmall,
                        color = AppColors.OnSurfaceVariant
                    )
                }
            }

            content()
        }
    }
}

// Enhanced Data class for pitch options
data class PitchOption(
    val size: String,
    val category: String,
    val description: String,
    val price: String
)