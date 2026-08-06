"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { Calendar, MessageCircle, Phone, Sparkles, Check, Star, Clock, Globe, Users } from "lucide-react";
import { Button, Badge, Avatar, AvatarImage, AvatarFallback, Card, CardContent, CardHeader, CardTitle } from "@zeal/ui";
import { formatDistanceToNow } from "date-fns";

// Mock consultant data – replace with API call
const mockConsultant = {
  id: "c1",
  name: "Rajesh Sharma",
  username: "raj_astrologer",
  avatar: "https://ui-avatars.com/api/?name=Rajesh+Sharma&background=9D7DC5&color=fff",
  bio: "Vedic Astrologer with 12+ years experience. Helping you find your path.",
  rating: 4.9,
  totalConsultations: 1200,
  sparks: 25000,
  perMinuteRate: 50,
  isOnline: true,
  isVerified: true,
  specialties: ["Vedic", "KP"],
  languages: ["Hindi", "English"],
  faith: "HINDU",
  experience: 12,
  reviews: [
    { id: "r1", user: "Priya", rating: 5, comment: "Amazing session!", date: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    { id: "r2", user: "Amit", rating: 4, comment: "Very insightful.", date: new Date(Date.now() - 1000 * 60 * 60 * 48) },
  ],
  availability: ["Mon 10:00-18:00", "Tue 10:00-18:00", "Wed 10:00-18:00", "Thu 10:00-18:00", "Fri 10:00-18:00"],
};

export default function ConsultantDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const consultantId = params.id;

  const consultant = mockConsultant; // In production: fetch by id

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 py-6"
    >
      {/* Back button */}
      <Link href="/explore" className="text-[#9D7DC5] hover:underline text-sm inline-block mb-4">
        ← Back to Explore
      </Link>

      {/* Profile header */}
      <Card className="border-[#E1C5E7] dark:border-gray-700 mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-[#E1C5E7]">
                <AvatarImage src={consultant.avatar} alt={consultant.name} />
                <AvatarFallback>{consultant.name?.[0]}</AvatarFallback>
              </Avatar>
              {consultant.isOnline && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              )}
              {consultant.isVerified && (
                <span className="absolute -top-1 -right-1 bg-[#9D7DC5] rounded-full p-0.5">
                  <Check className="w-4 h-4 text-white" />
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white">{consultant.name}</h1>
                <Badge variant="online" className="text-xs">Online</Badge>
                {consultant.isVerified && <Badge variant="success" className="text-xs">Verified</Badge>}
              </div>
              <p className="text-sm text-[#B8A1D9] dark:text-gray-400">@{consultant.username}</p>
              <p className="text-sm text-[#5E4B8B] dark:text-white mt-1">{consultant.bio}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-[#B8A1D9] dark:text-gray-400">
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /> {consultant.rating}</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {consultant.totalConsultations} consultations</span>
                <span className="flex items-center gap-1"><Sparkles className="w-4 h-4 text-[#FFD700]" /> {consultant.sparks} Sparks</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                className="w-full md:w-auto"
                onClick={() => router.push(`/booking?consultantId=${consultant.id}`)}
              >
                <Calendar className="w-4 h-4 mr-2" /> Book
              </Button>
              <Button
                variant="secondary"
                className="w-full md:w-auto"
                onClick={() => router.push(`/chat/${consultant.id}`)}
              >
                <MessageCircle className="w-4 h-4 mr-2" /> Chat
              </Button>
              <Button
                variant="secondary"
                className="w-full md:w-auto"
                onClick={() => alert("Call initiated!")}
              >
                <Phone className="w-4 h-4 mr-2" /> Call
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-[#E1C5E7] dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-[#5E4B8B] dark:text-white">Specialties & Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm"><span className="font-medium text-[#5E4B8B] dark:text-white">Specialties:</span> {consultant.specialties.join(", ")}</p>
            <p className="text-sm"><span className="font-medium text-[#5E4B8B] dark:text-white">Languages:</span> {consultant.languages.join(", ")}</p>
            <p className="text-sm"><span className="font-medium text-[#5E4B8B] dark:text-white">Faith:</span> {consultant.faith}</p>
            <p className="text-sm"><span className="font-medium text-[#5E4B8B] dark:text-white">Experience:</span> {consultant.experience} years</p>
            <p className="text-sm"><span className="font-medium text-[#5E4B8B] dark:text-white">Rate:</span> ₹{consultant.perMinuteRate}/min</p>
          </CardContent>
        </Card>

        <Card className="border-[#E1C5E7] dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-[#5E4B8B] dark:text-white">Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {consultant.availability.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-[#5E4B8B] dark:text-white">
                  <Clock className="w-4 h-4 text-[#B8A1D9]" />
                  <span>{slot}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews */}
      <Card className="border-[#E1C5E7] dark:border-gray-700 mt-6">
        <CardHeader>
          <CardTitle className="text-[#5E4B8B] dark:text-white">Reviews ({consultant.reviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {consultant.reviews.map((review) => (
              <div key={review.id} className="border-b border-[#E1C5E7] dark:border-gray-700 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#5E4B8B] dark:text-white">{review.user}</span>
                    <span className="text-yellow-500">{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span>
                  </div>
                  <span className="text-xs text-[#B8A1D9] dark:text-gray-400">
                    {formatDistanceToNow(review.date, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-[#5E4B8B] dark:text-white mt-1">{review.comment}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
