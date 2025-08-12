package com.project.odoo_235.presentation.screens.FacilatyUser.MainScreen

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MonetizationOn
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.SportsTennis
import androidx.compose.material.icons.filled.TrendingUp
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
import androidx.compose.ui.unit.times
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.project.odoo_235.data.datastore.UserSessionManager
import com.project.odoo_235.data.models.Court
import com.project.odoo_235.presentation.screens.FacilatyUser.componnets.FacilitCourtTopBar
import com.project.odoo_235.presentation.screens.FacilatyUser.componnets.FacityCourtBottomBar
import com.project.odoo_235.presentation.screens.FacilatyUser.navigation.Screen
import com.project.odoo_235.ui.theme.AppColors
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun FacilityDashboardScreen(
    navController: NavController,
    viewModel: FacilityDashboardViewModel = viewModel()
) {
    var venueId by remember { mutableStateOf("") }
    val context = LocalContext.current
    val sessionManager = remember { UserSessionManager(context) }
    val cachedUser by sessionManager.userData.collectAsState(initial = null)

    LaunchedEffect(cachedUser) {
        cachedUser?.let {
            venueId = it.id
        }
    }

    LaunchedEffect(venueId) {
        if (venueId.isNotBlank()) {
            viewModel.fetchUserCourts(venueId)
            viewModel.fetchUserBooking(venueId)
        }
    }

    val courts by viewModel.courts.collectAsState()
    val bookings by viewModel.bookings.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()

    val totalCourts by viewModel.totalCourts.collectAsState()
    val totalBookings by viewModel.totalBookings.collectAsState()
    val totalEarnings by viewModel.totalEarnings.collectAsState()
    val bookingTrends by viewModel.bookingTrends.collectAsState()
    val earningsSummary by viewModel.earningsSummary.collectAsState()

    // Trigger analytics processing when bookings change
    LaunchedEffect(bookings) {
        if (bookings.isNotEmpty()) {
            viewModel.processAnalytics(bookings)
        }
    }

    Scaffold(
        topBar = {
            FacilitCourtTopBar(
                currentLocation = "GandhiNagar",
                onProfileClick = { navController.navigate("profile") },
                onLocationClick = { }
            )
        },
        bottomBar = {
            FacityCourtBottomBar(
                navController = navController,
                currentRoute = Screen.MainDashBoard.routes
            )
        },
        containerColor = Color(0xFFF8F9FA)
    ) { paddingValues ->

        when {
            loading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        CircularProgressIndicator(
                            color = AppColors.Primary,
                            strokeWidth = 3.dp,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Loading your dashboard...",
                            style = MaterialTheme.typography.bodyMedium,
                            color = AppColors.OnSurfaceVariant
                        )
                    }
                }
            }
            error != null -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    Card(
                        modifier = Modifier.padding(32.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(8.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.BarChart,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = error ?: "Unknown error",
                                color = MaterialTheme.colorScheme.error,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
            }
            else -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    // Welcome Header
                    item {
                        WelcomeHeader(cachedUser?.name ?: "Manager")
                    }

                    // Analytics Cards
                    item {
                        AnalyticsSection(
                            totalCourts = totalCourts,
                            totalBookings = totalBookings,
                            totalEarnings = totalEarnings
                        )
                    }

                    // Charts Section
                    if (bookingTrends.isNotEmpty() || earningsSummary.isNotEmpty()) {
                        item {
                            ChartsSection(
                                bookingTrends = bookingTrends,
                                earningsSummary = earningsSummary
                            )
                        }
                    }

                    // Quick Actions
                    item {
                        QuickActionsSection(
                            onAddCourt = { navController.navigate(Screen.Add.routes) },
                            onViewBookings = { navController.navigate(Screen.booking.routes) },
                            onViewAnalytics = { /* TODO: Navigate to Analytics */ }
                        )
                    }

                    // Courts Section
                    item {
                        CourtsSection(courts = courts)
                    }
                }
            }
        }
    }
}

@Composable
fun WelcomeHeader(userName: String) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(8.dp, RoundedCornerShape(20.dp)),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(20.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(AppColors.Primary, AppColors.Primary.copy(0.8f))
                    )
                )
                .padding(24.dp)
        ) {
            Column {
                Text(
                    text = "Welcome back, $userName! 👋",
                    style = MaterialTheme.typography.headlineSmall,
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Here's what's happening with your facilities today",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.White.copy(0.9f)
                )
            }
        }
    }
}

@Composable
fun AnalyticsSection(
    totalCourts: Int,
    totalBookings: Int,
    totalEarnings: Double
) {
    Column {
        Text(
            text = "Analytics Overview",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = AppColors.OnSurface,
            modifier = Modifier.padding(bottom = 12.dp)
        )

        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(horizontal = 4.dp)
        ) {
            item {
                AnalyticsCard(
                    title = "Total Courts",
                    value = totalCourts.toString(),
                    icon = Icons.Default.SportsTennis,
                    color = Color(0xFF4CAF50),
                    gradient = listOf(Color(0xFF4CAF50), Color(0xFF45A049))
                )
            }
            item {
                AnalyticsCard(
                    title = "Total Bookings",
                    value = totalBookings.toString(),
                    icon = Icons.Default.CalendarToday,
                    color = Color(0xFF2196F3),
                    gradient = listOf(Color(0xFF2196F3), Color(0xFF1976D2))
                )
            }
            item {
                AnalyticsCard(
                    title = "Total Earnings",
                    value = "₹${"%.0f".format(totalEarnings)}",
                    icon = Icons.Default.MonetizationOn,
                    color = Color(0xFFFF9800),
                    gradient = listOf(Color(0xFFFF9800), Color(0xFFE68900))
                )
            }
        }
    }
}

@Composable
fun AnalyticsCard(
    title: String,
    value: String,
    icon: ImageVector,
    color: Color,
    gradient: List<Color>
) {
    var isVisible by remember { mutableStateOf(false) }
    val animatedScale by animateFloatAsState(
        targetValue = if (isVisible) 1f else 0.8f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy),
        label = "scale"
    )

    LaunchedEffect(Unit) {
        isVisible = true
    }

    Card(
        modifier = Modifier
            .width(160.dp)
            .height(120.dp)
            .shadow(8.dp, RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(16.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Brush.verticalGradient(gradient))
                .padding(16.dp)
        ) {
            Column {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = Color.White,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = value,
                    style = MaterialTheme.typography.headlineSmall,
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.White.copy(0.9f)
                )
            }
        }
    }
}

@Composable
fun ChartsSection(
    bookingTrends: List<BookingTrend>,
    earningsSummary: List<EarningsSummary>
) {
    Column {
        Text(
            text = "Performance Charts",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = AppColors.OnSurface,
            modifier = Modifier.padding(bottom = 12.dp)
        )

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(6.dp, RoundedCornerShape(16.dp)),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Booking Trends",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    Icon(
                        imageVector = Icons.Default.TrendingUp,
                        contentDescription = null,
                        tint = AppColors.Primary,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                if (bookingTrends.isNotEmpty()) {
                    SimpleBarChart(
                        data = bookingTrends.map { it.count.toFloat() },
                        labels = bookingTrends.map { it.label },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(180.dp)
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                Text(
                    text = "Earnings Overview",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(modifier = Modifier.height(16.dp))

                if (earningsSummary.isNotEmpty()) {
                    SimpleLineChart(
                        data = earningsSummary.map { it.amount.toFloat() },
                        labels = earningsSummary.map { it.label },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(120.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun SimpleBarChart(
    data: List<Float>,
    labels: List<String>,
    modifier: Modifier = Modifier
) {
    if (data.isEmpty()) return

    val maxValue = data.maxOrNull() ?: 1f

    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.Bottom
    ) {
        data.forEachIndexed { index, value ->
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.weight(1f)
            ) {
                val barHeight = (value / maxValue) * 140.dp

                Box(
                    modifier = Modifier
                        .width(32.dp)
                        .height(barHeight)
                        .background(
                            Brush.verticalGradient(
                                listOf(AppColors.Primary, AppColors.Primary.copy(0.7f))
                            ),
                            RoundedCornerShape(topStart = 8.dp, topEnd = 8.dp)
                        )
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = labels.getOrNull(index) ?: "",
                    style = MaterialTheme.typography.bodySmall,
                    textAlign = TextAlign.Center,
                    color = AppColors.OnSurfaceVariant,
                    maxLines = 1
                )
            }
        }
    }
}

@Composable
fun SimpleLineChart(
    data: List<Float>,
    labels: List<String>,
    modifier: Modifier = Modifier
) {
    if (data.isEmpty()) return

    val maxValue = data.maxOrNull() ?: 1f

    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.Bottom
    ) {
        data.forEachIndexed { index, value ->
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.weight(1f)
            ) {
                val pointHeight = (value / maxValue) * 80.dp

                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .background(AppColors.Primary, CircleShape)
                        .offset(y = -pointHeight)
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = labels.getOrNull(index) ?: "",
                    style = MaterialTheme.typography.bodySmall,
                    textAlign = TextAlign.Center,
                    color = AppColors.OnSurfaceVariant,
                    maxLines = 1
                )
            }
        }
    }
}

@Composable
fun QuickActionsSection(
    onAddCourt: () -> Unit,
    onViewBookings: () -> Unit,
    onViewAnalytics: () -> Unit
) {
    Column {
        Text(
            text = "Quick Actions",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = AppColors.OnSurface,
            modifier = Modifier.padding(bottom = 12.dp)
        )

        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(horizontal = 4.dp)
        ) {
            item {
                QuickActionCard(
                    title = "Add Court",
                    icon = Icons.Default.Add,
                    color = Color(0xFF4CAF50),
                    onClick = onAddCourt
                )
            }
            item {
                QuickActionCard(
                    title = "View Bookings",
                    icon = Icons.Default.CalendarToday,
                    color = Color(0xFF2196F3),
                    onClick = onViewBookings
                )
            }
            item {
                QuickActionCard(
                    title = "Analytics",
                    icon = Icons.Default.BarChart,
                    color = Color(0xFFFF9800),
                    onClick = onViewAnalytics
                )
            }
        }
    }
}

@Composable
fun QuickActionCard(
    title: String,
    icon: ImageVector,
    color: Color,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .width(120.dp)
            .height(80.dp)
            .clickable { onClick() }
            .shadow(4.dp, RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = color.copy(0.1f)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = color,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = color,
                fontWeight = FontWeight.Medium,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
fun CourtsSection(courts: List<Court>) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Your Courts (${courts.size})",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = AppColors.OnSurface
            )

            if (courts.isNotEmpty()) {
                TextButton(onClick = { /* TODO: View all courts */ }) {
                    Text("View All", color = AppColors.Primary)
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        when {
            courts.isEmpty() -> {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(4.dp, RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.SportsTennis,
                            contentDescription = null,
                            tint = AppColors.OnSurfaceVariant,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "No courts found",
                            style = MaterialTheme.typography.titleMedium,
                            color = AppColors.OnSurfaceVariant,
                            textAlign = TextAlign.Center
                        )
                        Text(
                            text = "Add your first court to get started",
                            style = MaterialTheme.typography.bodyMedium,
                            color = AppColors.OnSurfaceVariant.copy(0.7f),
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(20.dp))
                        Button(
                            onClick = { /* TODO: Navigate to add court */ },
                            colors = ButtonDefaults.buttonColors(containerColor = AppColors.Primary)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Add Court")
                        }
                    }
                }
            }
            else -> {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    contentPadding = PaddingValues(horizontal = 4.dp)
                ) {
                    items(courts.take(5)) { court ->
                        CourtCard(court = court)
                    }
                }
            }
        }
    }
}

@Composable
fun CourtCard(court: Court) {
    Card(
        modifier = Modifier
            .width(280.dp)
            .shadow(6.dp, RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = court.courtName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = AppColors.OnSurface
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = court.sportType,
                        style = MaterialTheme.typography.bodyMedium,
                        color = AppColors.Primary,
                        fontWeight = FontWeight.Medium
                    )
                }

                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(AppColors.Primary.copy(0.1f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.SportsTennis,
                        contentDescription = null,
                        tint = AppColors.Primary,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.LocationOn,
                    contentDescription = null,
                    tint = AppColors.OnSurfaceVariant,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = court.city,
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.OnSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Schedule,
                    contentDescription = null,
                    tint = AppColors.OnSurfaceVariant,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = court.availableDate,
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.OnSurfaceVariant
                )
            }
        }
    }
}

// Data classes for analytics
data class BookingTrend(val label: String, val count: Int)
data class EarningsSummary(val label: String, val amount: Double)
data class HourlyBooking(val hour: Int, val count: Int)