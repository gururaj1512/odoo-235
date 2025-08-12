import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

interface AdminStats {
  totalUsers: number;
  totalOwners: number;
  totalBookings: number;
  totalRevenue: number;
  totalActiveCourts: number;
  pendingFacilitiesCount: number;
  activeFacilities: number;
  userRegistrationTrends: any[];
  bookingActivity: any[];
  mostActiveSports: any[];
  facilityPerformance: any[];
  platformGrowth: {
    userGrowth: number;
    bookingGrowth: number;
    revenueGrowth: number;
    facilityGrowth: number;
  };
}

export class PDFService {
  static async generateAdminReport(stats: AdminStats): Promise<void> {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246); // Blue color
    doc.text('QuickCourt Admin Report', 105, 20, { align: 'center' });
    
    // Add date
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128); // Gray color
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
    
    // Executive Summary
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39); // Dark color
    doc.text('Executive Summary', 20, 45);
    
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    
    const summaryData = [
      ['Metric', 'Value', 'Growth'],
      ['Total Users', stats.totalUsers.toString(), `${stats.platformGrowth.userGrowth >= 0 ? '+' : ''}${stats.platformGrowth.userGrowth}%`],
      ['Total Facility Owners', stats.totalOwners.toString(), 'N/A'],
      ['Total Bookings', stats.totalBookings.toString(), `${stats.platformGrowth.bookingGrowth >= 0 ? '+' : ''}${stats.platformGrowth.bookingGrowth}%`],
      ['Total Revenue', `₹${stats.totalRevenue.toLocaleString()}`, `${stats.platformGrowth.revenueGrowth >= 0 ? '+' : ''}${stats.platformGrowth.revenueGrowth}%`],
      ['Active Facilities', stats.activeFacilities.toString(), `${stats.platformGrowth.facilityGrowth >= 0 ? '+' : ''}${stats.platformGrowth.facilityGrowth}%`],
      ['Pending Approvals', stats.pendingFacilitiesCount.toString(), 'N/A'],
      ['Total Courts', stats.totalActiveCourts.toString(), 'N/A'],
    ];
    
    autoTable(doc, {
      head: [['Metric', 'Value', 'Growth']],
      body: summaryData.slice(1),
      startY: 50,
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });
    
    // Derived Statistics
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text('Derived Statistics', 20, 120);
    
    const derivedStats = this.calculateDerivedStats(stats);
    const derivedData = [
      ['Metric', 'Value', 'Description'],
      ['Average Revenue per Booking', `₹${derivedStats.avgRevenuePerBooking.toLocaleString()}`, 'Total revenue divided by total bookings'],
      ['User to Owner Ratio', `${derivedStats.userToOwnerRatio.toFixed(2)}:1`, 'Ratio of regular users to facility owners'],
      ['Booking per User Ratio', `${derivedStats.bookingsPerUser.toFixed(2)}`, 'Average bookings per user'],
      ['Revenue per User', `₹${derivedStats.revenuePerUser.toLocaleString()}`, 'Average revenue generated per user'],
      ['Facility Utilization Rate', `${derivedStats.facilityUtilizationRate.toFixed(1)}%`, 'Active facilities vs total facilities'],
      ['Court Utilization Rate', `${derivedStats.courtUtilizationRate.toFixed(1)}%`, 'Bookings vs available court capacity'],
      ['Platform Efficiency Score', `${derivedStats.platformEfficiencyScore.toFixed(1)}/100`, 'Overall platform performance score'],
      ['Growth Momentum', `${derivedStats.growthMomentum}`, 'Combined growth indicators'],
    ];
    
    autoTable(doc, {
      head: [['Metric', 'Value', 'Description']],
      body: derivedData.slice(1),
      startY: 130,
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [34, 197, 94], // Green color
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });
    
    // Most Active Sports
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text('Sports Performance Analysis', 20, 20);
    
    const sportsData = stats.mostActiveSports.map(sport => [
      sport.sport,
      sport.bookings.toString(),
      `₹${sport.revenue.toLocaleString()}`,
      `${((sport.bookings / stats.totalBookings) * 100).toFixed(1)}%`,
      `₹${Math.round(sport.revenue / sport.bookings).toLocaleString()}`,
    ]);
    
    autoTable(doc, {
      head: [['Sport', 'Bookings', 'Revenue', 'Market Share', 'Avg Revenue/Booking']],
      body: sportsData,
      startY: 30,
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [245, 158, 11], // Orange color
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });
    
    // Top Performing Facilities
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text('Top Performing Facilities', 20, 100);
    
    const facilityData = stats.facilityPerformance.map(facility => [
      facility.facility.length > 20 ? facility.facility.substring(0, 20) + '...' : facility.facility,
      facility.bookings.toString(),
      `₹${facility.revenue.toLocaleString()}`,
      facility.rating > 0 ? facility.rating.toFixed(1) : 'N/A',
      `${((facility.revenue / stats.totalRevenue) * 100).toFixed(1)}%`,
    ]);
    
    autoTable(doc, {
      head: [['Facility', 'Bookings', 'Revenue', 'Rating', 'Revenue Share']],
      body: facilityData,
      startY: 110,
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [168, 85, 247], // Purple color
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });
    
    // User Registration Trends
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text('User Registration Trends', 20, 20);
    
    const registrationData = stats.userRegistrationTrends.map(trend => [
      trend.month,
      trend.users.toString(),
      trend.owners.toString(),
      (trend.users + trend.owners).toString(),
    ]);
    
    autoTable(doc, {
      head: [['Period', 'Users', 'Owners', 'Total']],
      body: registrationData,
      startY: 30,
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue color
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });
    
    // Booking Activity Trends
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text('Booking Activity Trends', 20, 100);
    
    const bookingData = stats.bookingActivity.map(activity => [
      activity.day,
      activity.bookings.toString(),
      `₹${activity.revenue.toLocaleString()}`,
      `₹${Math.round(activity.revenue / activity.bookings || 0).toLocaleString()}`,
    ]);
    
    autoTable(doc, {
      head: [['Period', 'Bookings', 'Revenue', 'Avg Revenue/Booking']],
      body: bookingData,
      startY: 110,
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [34, 197, 94], // Green color
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });
    
    // Recommendations Section
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text('Strategic Recommendations', 20, 20);
    
    const recommendations = this.generateRecommendations(stats, derivedStats);
    
    doc.setFontSize(12);
    doc.setTextColor(55, 65, 81);
    
    recommendations.forEach((rec, index) => {
      const y = 35 + (index * 15);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${rec.title}`, 20, y);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text(rec.description, 20, y + 5, { maxWidth: 170 });
    });
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      doc.text('QuickCourt Admin Report', 20, 290);
    }
    
    // Save the PDF
    doc.save(`QuickCourt_Admin_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  }
  
  private static calculateDerivedStats(stats: AdminStats) {
    const avgRevenuePerBooking = stats.totalBookings > 0 ? stats.totalRevenue / stats.totalBookings : 0;
    const userToOwnerRatio = stats.totalOwners > 0 ? (stats.totalUsers - stats.totalOwners) / stats.totalOwners : 0;
    const bookingsPerUser = stats.totalUsers > 0 ? stats.totalBookings / stats.totalUsers : 0;
    const revenuePerUser = stats.totalUsers > 0 ? stats.totalRevenue / stats.totalUsers : 0;
    const facilityUtilizationRate = (stats.activeFacilities / (stats.activeFacilities + stats.pendingFacilitiesCount)) * 100;
    const courtUtilizationRate = stats.totalActiveCourts > 0 ? (stats.totalBookings / (stats.totalActiveCourts * 8)) * 100 : 0; // Assuming 8 hours per court per day
    
    // Platform Efficiency Score (0-100)
    const efficiencyFactors = [
      (stats.platformGrowth.userGrowth + 20) / 40 * 25, // User growth (max 25 points)
      (stats.platformGrowth.bookingGrowth + 20) / 40 * 25, // Booking growth (max 25 points)
      (stats.platformGrowth.revenueGrowth + 20) / 40 * 25, // Revenue growth (max 25 points)
      (facilityUtilizationRate / 100) * 25, // Facility utilization (max 25 points)
    ];
    const platformEfficiencyScore = Math.min(100, Math.max(0, efficiencyFactors.reduce((sum, factor) => sum + factor, 0)));
    
    // Growth Momentum
    const growthMomentum = [
      stats.platformGrowth.userGrowth > 0 ? 'Strong' : 'Weak',
      stats.platformGrowth.bookingGrowth > 0 ? 'Strong' : 'Weak',
      stats.platformGrowth.revenueGrowth > 0 ? 'Strong' : 'Weak',
    ].filter(momentum => momentum === 'Strong').length >= 2 ? 'Strong' : 'Moderate';
    
    return {
      avgRevenuePerBooking,
      userToOwnerRatio,
      bookingsPerUser,
      revenuePerUser,
      facilityUtilizationRate,
      courtUtilizationRate,
      platformEfficiencyScore,
      growthMomentum,
    };
  }
  
  private static generateRecommendations(stats: AdminStats, derivedStats: any) {
    const recommendations = [];
    
    // User Growth Recommendations
    if (stats.platformGrowth.userGrowth < 0) {
      recommendations.push({
        title: 'User Acquisition Strategy',
        description: 'Focus on marketing campaigns and referral programs to increase user registration. Consider offering incentives for new user signups.',
      });
    }
    
    // Revenue Optimization
    if (derivedStats.avgRevenuePerBooking < 1000) {
      recommendations.push({
        title: 'Revenue Optimization',
        description: 'Implement dynamic pricing strategies and premium features to increase average revenue per booking.',
      });
    }
    
    // Facility Management
    if (stats.pendingFacilitiesCount > 5) {
      recommendations.push({
        title: 'Facility Approval Process',
        description: 'Streamline the facility approval process to reduce pending applications and improve platform growth.',
      });
    }
    
    // Sports Performance
    const topSport = stats.mostActiveSports[0];
    if (topSport && (topSport.bookings / stats.totalBookings) > 0.4) {
      recommendations.push({
        title: 'Diversify Sports Portfolio',
        description: `Consider promoting other sports as ${topSport.sport} dominates ${((topSport.bookings / stats.totalBookings) * 100).toFixed(1)}% of bookings.`,
      });
    }
    
    // Platform Efficiency
    if (derivedStats.platformEfficiencyScore < 70) {
      recommendations.push({
        title: 'Platform Optimization',
        description: 'Focus on improving user experience, reducing booking friction, and enhancing facility management tools.',
      });
    }
    
    // Court Utilization
    if (derivedStats.courtUtilizationRate < 50) {
      recommendations.push({
        title: 'Court Utilization Improvement',
        description: 'Implement strategies to increase court utilization, such as off-peak pricing and promotional campaigns.',
      });
    }
    
    return recommendations;
  }
}
