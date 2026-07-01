"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaUsers,
  FaUserTie,
  FaStar,
  FaHeart,
  FaArrowRight,
} from "react-icons/fa";
import { IoSparkles, IoPeopleCircle, IoRocket } from "react-icons/io5";

import useSWR from "swr";

export default function OurTeam() {
  const { t } = useTranslation();

  const { data: teamMembersData, error: teamError } = useSWR("/api/admin/team");

  const teamMembers = teamMembersData || [];
  const loading = !teamMembersData && !teamError;
  const error = teamError ? teamError.message : "";

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary text-lg font-semibold">
            {t("loadingAmazingTeam")}
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-6">
        <div className="alert alert-error max-w-4xl mx-auto shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-semibold">Error: {error}</span>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center shadow-2xl">
                <FaUsers className="text-3xl text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-lg">
                <IoSparkles className="text-sm text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">
            {t("meetOurTeam")}
          </h1>

          <div className="w-32 h-1.5 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mb-6"></div>

          <p className="text-xl text-primary/70 max-w-2xl mx-auto leading-relaxed">
            {t("talentedIndividuals")}
          </p>

          <div className="flex justify-center items-center space-x-8 mt-8 text-primary/60">
            <div className="flex items-center space-x-2">
              <IoPeopleCircle className="text-primary" />
              <span className="font-semibold">
                {teamMembers.length}+ Members
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <FaHeart className="text-red-400" />
              <span className="font-semibold">{t("passionateTeam")}</span>
            </div>
          </div>
        </div>

        {teamMembers.length === 0 ? (
          <div className="card bg-white shadow-2xl max-w-md mx-auto border border-primary/20">
            <div className="card-body text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoRocket className="text-3xl text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">
                {t("ourTeamIsGrowing")}
              </h2>
              <p className="text-primary/60">
                {t("checkBackSoon")}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member._id}
                className="card bg-white w-full shadow-xl hover:shadow-2xl transition-all duration-500 border border-primary/10 hover:border-primary/30 group"
              >
                <figure className="pt-8 px-8">
                  <div className="relative">
                    <div className="avatar w-36 h-36 rounded-full bg-gradient-to-br from-primary to-accent p-1.5 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        sizes="144px"
                        className="rounded-full object-cover border-4 border-white"
                      />
                    </div>
                    <div className="absolute bottom-4 right-4 w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-md"></div>
                  </div>
                </figure>

                <div className="card-body items-center text-center pt-6">
                  <h2 className="card-title text-2xl font-bold text-primary mb-2">
                    {member.name}
                  </h2>

                  <div className="badge badge-primary badge-lg py-3 px-4 text-white font-semibold border-0 shadow-md">
                    <FaUserTie className="mr-2" />
                    {member.role}
                  </div>

                  <p className="text-primary/70 leading-relaxed mt-4 min-h-[60px]">
                    {member.comment}
                  </p>

                  <div className="flex gap-3 mt-6">
                    {member.facebook && (
                      <a
                        href={member.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-circle btn-outline btn-primary border-2 w-12 h-12 hover:bg-primary hover:text-white hover:scale-110 transition-all duration-300"
                      >
                        <FaFacebook className="w-5 h-5" />
                      </a>
                    )}
                    {member.twitter && (
                      <a
                        href={member.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-circle btn-outline btn-primary border-2 w-12 h-12 hover:bg-primary hover:text-white hover:scale-110 transition-all duration-300"
                      >
                        <FaTwitter className="w-5 h-5" />
                      </a>
                    )}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-circle btn-outline btn-primary border-2 w-12 h-12 hover:bg-primary hover:text-white hover:scale-110 transition-all duration-300"
                      >
                        <FaLinkedin className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary to-secondary  rounded-2xl p-8 text-white shadow-2xl max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              {t("readyToJoinTeam")}
            </h3>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              {t("lookingForTalentedIndividuals")}
            </p>
            <button className="btn btn-white  btn-lg text-primary font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              {t("exploreCareers")}
              <IoRocket className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
