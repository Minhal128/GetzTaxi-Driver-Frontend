import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/core';

const Support = () => {
  const [faqExpanded, setFaqExpanded] = useState(true);
  const [scheduleRideExpanded, setScheduleRideExpanded] = useState(false);
  const [driverCancelsExpanded, setDriverCancelsExpanded] = useState(false);
  const [reportIssueExpanded, setReportIssueExpanded] = useState(false);
const navigation = useNavigation();
  const toggleFaq = () => {
    setFaqExpanded(!faqExpanded);
  };

  const toggleScheduleRide = () => {
    setScheduleRideExpanded(!scheduleRideExpanded);
  };

  const toggleDriverCancels = () => {
    setDriverCancelsExpanded(!driverCancelsExpanded);
  };

  const toggleReportIssue = () => {
    setReportIssueExpanded(!reportIssueExpanded);
  };

  const handleContactUs = () => {
    // Implement navigation or action for "Contact us"
    console.log('Contact us pressed');
    // You might want to open a modal, navigate to a contact form, etc.
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Support center</Text>
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabButtons}>
        <TouchableOpacity style={[styles.tabButton, styles.activeTab]}>
          <Text style={styles.activeTabText}>FAQ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={handleContactUs}>
          <Text style={styles.tabText}>Contact us</Text>
        </TouchableOpacity>
      </View>

      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <TouchableOpacity style={styles.faqQuestion} onPress={toggleFaq}>
          <Text style={styles.questionText}>How do I book a ride?</Text>
          <Ionicons
            name={faqExpanded ? 'remove-outline' : 'add-outline'}
            size={20}
            color="#777"
          />
        </TouchableOpacity>
        {faqExpanded && (
          <Text style={styles.answerText}>
            It's important to address common questions and concerns that users may have
            about the app. Here are some necessary questions to include
          </Text>
        )}

        <TouchableOpacity style={styles.faqQuestion} onPress={toggleScheduleRide}>
          <Text style={styles.questionText}>Can I schedule a ride in advance?</Text>
          <Ionicons
            name={scheduleRideExpanded ? 'remove-outline' : 'add-outline'}
            size={20}
            color="#777"
          />
        </TouchableOpacity>
        {scheduleRideExpanded && (
          <Text style={styles.answerText}>
            Information about scheduling rides in advance would go here.
          </Text>
        )}

        <TouchableOpacity style={styles.faqQuestion} onPress={toggleDriverCancels}>
          <Text style={styles.questionText}>What if my driver cancels the ride?</Text>
          <Ionicons
            name={driverCancelsExpanded ? 'remove-outline' : 'add-outline'}
            size={20}
            color="#777"
          />
        </TouchableOpacity>
        {driverCancelsExpanded && (
          <Text style={styles.answerText}>
            Details about what happens if a driver cancels a ride.
          </Text>
        )}

        <TouchableOpacity style={styles.faqQuestion} onPress={toggleReportIssue}>
          <Text style={styles.questionText}>How do I report an issue with my ride?</Text>
          <Ionicons
            name={reportIssueExpanded ? 'remove-outline' : 'add-outline'}
            size={20}
            color="#777"
          />
        </TouchableOpacity>
        {reportIssueExpanded && (
          <Text style={styles.answerText}>
            Steps on how to report an issue with a ride.
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop:30
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  tabButtons: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#27AE60',
  },
  tabText: {
    fontSize: 16,
    color: '#777',
  },
  activeTabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  faqSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    paddingVertical: 10,
  },
});

export default Support;