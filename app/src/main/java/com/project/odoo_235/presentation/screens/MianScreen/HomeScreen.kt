package com.project.odoo_235.presentation.screens.MianScreen

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.Star
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.project.odoo_235.data.models.Court
import com.project.odoo_235.presentation.navigation.Screen
import com.project.odoo_235.presentation.screens.components.QuickCourtBottomBar
import com.project.odoo_235.presentation.screens.components.QuickCourtTopBar
import com.project.odoo_235.ui.theme.AppColors
import kotlin.random.Random

@Composable
fun HomeScreen(
    navController: NavController,
    mainViewModel: MainViewModel,
    currentRoute: String = "home"
) {
    val context = LocalContext.current

    val cityName by mainViewModel.currentCity.collectAsState()
    val courts by mainViewModel.courts.collectAsState()
    val isLoading by mainViewModel.loading.collectAsState()
    val errorMessage by mainViewModel.error.collectAsState()

    // Random ratings map (simulate backend ratings)
    val ratingsMap = remember(courts) {
        courts.associate { it._id to (1..5).random() }
    }

    // Filter states
    var selectedCity by remember { mutableStateOf<String?>(null) }
    var selectedSport by remember { mutableStateOf<String?>(null) }
    var selectedRating by remember { mutableStateOf(1) }

    // Dialog control states
    var showCityDialog by remember { mutableStateOf(false) }
    var showSportDialog by remember { mutableStateOf(false) }
    var showRatingDialog by remember { mutableStateOf(false) }

    // Compute distinct options
    val cityOptions = courts.map { it.city }.distinct().sorted()
    val sportOptions = courts.map { it.sportType }.distinct().sorted()

    LaunchedEffect(Unit) {
        mainViewModel.fetchCurrentCity(context)
        mainViewModel.fetchCourts()
    }

    Scaffold(
        topBar = {
            QuickCourtTopBar(
                currentLocation = cityName,
                onProfileClick = { navController.navigate("profile") },
                onLocationClick = { mainViewModel.fetchCurrentCity(context) }
            )
        },
        bottomBar = {
            QuickCourtBottomBar(
                navController = navController,
                currentRoute = currentRoute
            )
        },
        containerColor = AppColors.Background
    ) { paddingValues ->

        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(AppColors.Background)
                .padding(paddingValues)
        ) {
            // Welcome Header Section
            WelcomeHeader()

            // Quick Stats Section
            QuickStatsSection(courts.size)

            // Filter Section
            FilterSection(
                selectedCity = selectedCity,
                selectedSport = selectedSport,
                selectedRating = selectedRating,
                onCityFilterClick = { showCityDialog = true },
                onSportFilterClick = { showSportDialog = true },
                onRatingFilterClick = { showRatingDialog = true }
            )

            // Main Content
            when {
                isLoading -> {
                    LoadingSection()
                }
                !errorMessage.isNullOrEmpty() -> {
                    ErrorSection(errorMessage ?: "Unknown error")
                }
                else -> {
                    val filteredCourts = courts.filter { court ->
                        val rating = ratingsMap[court._id] ?: 0
                        val cityMatches = selectedCity == null || court.city == selectedCity
                        val sportMatches = selectedSport == null || court.sportType == selectedSport
                        val ratingMatches = rating >= selectedRating
                        cityMatches && sportMatches && ratingMatches
                    }

                    if (filteredCourts.isEmpty()) {
                        EmptyStateSection()
                    } else {
                        CourtsListSection(filteredCourts, navController, ratingsMap)
                    }
                }
            }
        }

        // Filter Dialogs
        if (showCityDialog) {
            EnhancedFilterDialog(
                title = "Select City",
                options = listOf("All") + cityOptions,
                selectedOption = selectedCity ?: "All",
                onDismiss = { showCityDialog = false },
                onOptionSelected = { selected ->
                    selectedCity = if (selected == "All") null else selected
                    showCityDialog = false
                }
            )
        }

        if (showSportDialog) {
            EnhancedFilterDialog(
                title = "Select Sport",
                options = listOf("All") + sportOptions,
                selectedOption = selectedSport ?: "All",
                onDismiss = { showSportDialog = false },
                onOptionSelected = { selected ->
                    selectedSport = if (selected == "All") null else selected
                    showSportDialog = false
                }
            )
        }

        if (showRatingDialog) {
            EnhancedFilterDialog(
                title = "Select Minimum Rating",
                options = listOf("1⭐", "2⭐", "3⭐", "4⭐", "5⭐"),
                selectedOption = "$selectedRating⭐",
                onDismiss = { showRatingDialog = false },
                onOptionSelected = { selected ->
                    selectedRating = selected.first().digitToIntOrNull() ?: 1
                    showRatingDialog = false
                }
            )
        }
    }
}

@Composable
fun WelcomeHeader() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = AppColors.Primary),
        elevation = CardDefaults.cardElevation(8.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(AppColors.Primary, AppColors.PrimaryVariant)
                    )
                )
                .padding(24.dp)
        ) {
            Column {
                Text(
                    text = "Find Your Perfect Court",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = AppColors.OnPrimary
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Book sports courts near you instantly",
                    fontSize = 14.sp,
                    color = AppColors.OnPrimary.copy(alpha = 0.9f)
                )
            }
            Icon(
                imageVector = Icons.Default.SportsTennis,
                contentDescription = null,
                tint = AppColors.OnPrimary.copy(alpha = 0.3f),
                modifier = Modifier
                    .size(80.dp)
                    .align(Alignment.CenterEnd)
            )
        }
    }
}

@Composable
fun QuickStatsSection(totalCourts: Int) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = AppColors.Surface),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            StatItem(
                icon = Icons.Default.Stadium,
                value = totalCourts.toString(),
                label = "Courts Available",
                color = AppColors.Success
            )
            StatItem(
                icon = Icons.Default.LocationCity,
                value = "5+",
                label = "Cities",
                color = AppColors.Info
            )
            StatItem(
                icon = Icons.Default.Group,
                value = "1000+",
                label = "Happy Players",
                color = AppColors.Warning
            )
        }
    }
}

@Composable
fun StatItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    value: String,
    label: String,
    color: Color
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(48.dp)
                .background(color.copy(alpha = 0.1f), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(24.dp)
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = value,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = AppColors.OnSurface
        )
        Text(
            text = label,
            fontSize = 12.sp,
            color = AppColors.OnSurfaceVariant,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
fun FilterSection(
    selectedCity: String?,
    selectedSport: String?,
    selectedRating: Int,
    onCityFilterClick: () -> Unit,
    onSportFilterClick: () -> Unit,
    onRatingFilterClick: () -> Unit
) {
    Column(
        modifier = Modifier.padding(16.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(
                imageVector = Icons.Default.FilterList,
                contentDescription = null,
                tint = AppColors.OnSurfaceVariant,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Filters",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = AppColors.OnSurface
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                EnhancedFilterChip(
                    label = "City",
                    selectedOption = selectedCity ?: "All",
                    isSelected = selectedCity != null,
                    onClick = onCityFilterClick
                )
            }
            item {
                EnhancedFilterChip(
                    label = "Sport",
                    selectedOption = selectedSport ?: "All",
                    isSelected = selectedSport != null,
                    onClick = onSportFilterClick
                )
            }
            item {
                EnhancedFilterChip(
                    label = "Rating",
                    selectedOption = "$selectedRating⭐",
                    isSelected = selectedRating > 1,
                    onClick = onRatingFilterClick
                )
            }
        }
    }
}

@Composable
fun EnhancedFilterChip(
    label: String,
    selectedOption: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    FilterChip(
        onClick = onClick,
        label = {
            Text(
                text = "$label: $selectedOption",
                fontSize = 14.sp,
                fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal
            )
        },
        selected = isSelected,
        colors = FilterChipDefaults.filterChipColors(
            containerColor = if (isSelected) AppColors.Primary.copy(alpha = 0.1f) else AppColors.SurfaceVariant,
            labelColor = if (isSelected) AppColors.Primary else AppColors.OnSurfaceVariant,
            selectedContainerColor = AppColors.Primary.copy(alpha = 0.2f),
            selectedLabelColor = AppColors.Primary
        ),
        leadingIcon = if (isSelected) {
            {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp)
                )
            }
        } else null
    )
}

@Composable
fun LoadingSection() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            CircularProgressIndicator(
                color = AppColors.Primary,
                strokeWidth = 3.dp
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Loading courts...",
                color = AppColors.OnSurfaceVariant,
                fontSize = 14.sp
            )
        }
    }
}

@Composable
fun ErrorSection(errorMessage: String) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        colors = CardDefaults.cardColors(containerColor = AppColors.Error.copy(alpha = 0.1f)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = Icons.Default.Error,
                contentDescription = null,
                tint = AppColors.Error,
                modifier = Modifier.size(48.dp)
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Something went wrong",
                fontWeight = FontWeight.Bold,
                color = AppColors.Error
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = errorMessage,
                color = AppColors.OnSurfaceVariant,
                textAlign = TextAlign.Center,
                fontSize = 14.sp
            )
        }
    }
}

@Composable
fun EmptyStateSection() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(32.dp)
        ) {
            Icon(
                imageVector = Icons.Default.SearchOff,
                contentDescription = null,
                tint = AppColors.OnSurfaceVariant.copy(alpha = 0.6f),
                modifier = Modifier.size(80.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "No courts found",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = AppColors.OnSurface
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Try adjusting your filters to find more courts",
                color = AppColors.OnSurfaceVariant,
                textAlign = TextAlign.Center,
                fontSize = 14.sp
            )
        }
    }
}

@Composable
fun CourtsListSection(
    courts: List<Court>,
    navController: NavController,
    ratingsMap: Map<String, Int>
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(courts, key = { it._id }) { court ->
            AnimatedVisibility(
                visible = true,
                enter = slideInVertically(
                    initialOffsetY = { it },
                    animationSpec = tween(300)
                ) + fadeIn(animationSpec = tween(300))
            ) {
                EnhancedCourtCard(
                    court = court,
                    rating = ratingsMap[court._id] ?: 1
                ) {
                    navController.navigate(Screen.BookingScreen.bookingScreen(court._id))
                }
            }
        }
    }
}

@Composable
fun EnhancedCourtCard(court: Court, rating: Int, onBookClick: () -> Unit) {
    var currentRating by remember { mutableStateOf(rating) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(6.dp, RoundedCornerShape(16.dp))
            .clickable { onBookClick() },
        colors = CardDefaults.cardColors(containerColor = AppColors.Surface),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            // Court Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = court.venueName,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = AppColors.OnSurface,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = court.courtName,
                        fontSize = 14.sp,
                        color = AppColors.OnSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                // Status Badge
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = if (court.actions.canBook)
                            AppColors.Success.copy(alpha = 0.1f)
                        else
                            AppColors.Error.copy(alpha = 0.1f)
                    ),
                    shape = RoundedCornerShape(20.dp)
                ) {
                    Text(
                        text = court.status,
                        color = if (court.actions.canBook) AppColors.Success else AppColors.Error,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Court Details
            Row(
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                CourtInfoItem(
                    icon = Icons.Default.SportsSoccer,
                    label = court.sportType,
                    color = AppColors.Info
                )
                CourtInfoItem(
                    icon = Icons.Default.LocationOn,
                    label = court.city,
                    color = AppColors.Warning
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Time and Date Info
            Card(
                colors = CardDefaults.cardColors(containerColor = AppColors.SurfaceVariant),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.CalendarToday,
                            contentDescription = null,
                            tint = AppColors.Primary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = court.availableDate,
                            fontSize = 13.sp,
                            color = AppColors.OnSurfaceVariant
                        )
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.AccessTime,
                            contentDescription = null,
                            tint = AppColors.Primary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = court.availableTime,
                            fontSize = 13.sp,
                            color = AppColors.OnSurfaceVariant
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Rating and Book Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Rating Stars
                Row(verticalAlignment = Alignment.CenterVertically) {
                    for (i in 1..5) {
                        val starIcon = if (i <= currentRating) Icons.Filled.Star else Icons.Outlined.Star
                        Icon(
                            imageVector = starIcon,
                            contentDescription = "Star $i",
                            tint = AppColors.Warning,
                            modifier = Modifier
                                .size(20.dp)
                                .clickable { currentRating = i }
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "($currentRating/5)",
                        fontSize = 12.sp,
                        color = AppColors.OnSurfaceVariant
                    )
                }

                // Book Button
                Button(
                    onClick = onBookClick,
                    enabled = court.actions.canBook,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = AppColors.Primary,
                        disabledContainerColor = AppColors.OnSurfaceVariant.copy(alpha = 0.3f)
                    ),
                    shape = RoundedCornerShape(24.dp),
                    contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.BookOnline,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Book Now",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}

@Composable
fun CourtInfoItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    color: Color
) {
    Row(
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(24.dp)
                .background(color.copy(alpha = 0.1f), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(12.dp)
            )
        }
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = label,
            fontSize = 13.sp,
            color = AppColors.OnSurfaceVariant,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

@Composable
fun EnhancedFilterDialog(
    title: String,
    options: List<String>,
    selectedOption: String,
    onDismiss: () -> Unit,
    onOptionSelected: (String) -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = title,
                fontWeight = FontWeight.Bold,
                color = AppColors.OnSurface
            )
        },
        text = {
            LazyColumn {
                items(options) { option ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 2.dp)
                            .clickable { onOptionSelected(option) },
                        colors = CardDefaults.cardColors(
                            containerColor = if (option == selectedOption)
                                AppColors.Primary.copy(alpha = 0.1f)
                            else
                                Color.Transparent
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(12.dp)
                        ) {
                            RadioButton(
                                selected = option == selectedOption,
                                onClick = { onOptionSelected(option) },
                                colors = RadioButtonDefaults.colors(
                                    selectedColor = AppColors.Primary
                                )
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                text = option,
                                color = if (option == selectedOption) AppColors.Primary else AppColors.OnSurface,
                                fontWeight = if (option == selectedOption) FontWeight.SemiBold else FontWeight.Normal
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = onDismiss,
                colors = ButtonDefaults.textButtonColors(
                    contentColor = AppColors.Primary
                )
            ) {
                Text("Close")
            }
        },
        containerColor = AppColors.Surface,
        shape = RoundedCornerShape(16.dp)
    )
}