"use client";
import React, { useState } from "react";
import { Eye, Star, MessageCircle, ArrowRight } from "lucide-react";

const mockJobs = [
  {
    id: "job1",
    title: "Frontend Developer",
    requiredSkills: ["React", "JavaScript", "CSS", "HTML", "TypeScript"],
    requiredExperience: 2,
    requiredEducation: "BSc Computer Science",
  },
  {
    id: "job2",
    title: "Backend Developer",
    requiredSkills: ["Node.js", "Express", "MongoDB", "APIs", "TypeScript"],
    requiredExperience: 3,
    requiredEducation: "BSc Software Engineering",
  },
  {
    id: "job3",
    title: "UI/UX Designer",
    requiredSkills: ["Figma", "Wireframing", "Prototyping", "User Research"],
    requiredExperience: 1,
    requiredEducation: "BA Design",
  },
];

const mockCandidates = [
  {
    id: "1",
    name: "Jane Doe",
    skills: ["React", "JavaScript", "CSS", "HTML", "Redux"],
    experience: 2,
    education: "BSc Computer Science",
  },
  {
    id: "2",
    name: "John Smith",
    skills: ["Node.js", "Express", "MongoDB", "APIs", "Docker"],
    experience: 4,
    education: "BSc Software Engineering",
  },
  {
    id: "3",
    name: "Alice Johnson",
    skills: ["Figma", "Wireframing", "User Research", "Photoshop"],
    experience: 1,
    education: "BA Design",
  },
  {
    id: "4",
    name: "Michael Brown",
    skills: ["React", "TypeScript", "APIs", "MongoDB"],
    experience: 1,
    education: "BSc Computer Science",
  },
  {
    id: "5",
    name: "Emily Davis",
    skills: ["CSS", "HTML", "Figma", "Prototyping"],
    experience: 3,
    education: "BA Design",
  },
];

function getMatchScore(
  candidate: { skills: string[]; experience: number; education: string },
  job: {
    requiredSkills: string[];
    requiredExperience: number;
    requiredEducation: string;
  }
) {
  const matched = job.requiredSkills.filter((skill: string) =>
    candidate.skills.includes(skill)
  );
  let score = Math.round((matched.length / job.requiredSkills.length) * 80); // skills = 80%
  const missing = job.requiredSkills.filter(
    (s: string) => !candidate.skills.includes(s)
  );
  let expMatch = false,
    eduMatch = false;
  if (candidate.experience >= job.requiredExperience) {
    score += 10;
    expMatch = true;
  }
  if (candidate.education === job.requiredEducation) {
    score += 10;
    eduMatch = true;
  }
  if (score > 100) score = 100;
  return { score, matched, missing, expMatch, eduMatch };
}

const pipelineStages = ["Applied", "Screening", "Interview", "Offer", "Hired"];

export default function CVMatchingPage() {
  const [selectedJobId, setSelectedJobId] = useState(mockJobs[0].id);
  const [shortlisted, setShortlisted] = useState<string[]>([]);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [modalCandidate, setModalCandidate] = useState<any>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTarget, setMessageTarget] = useState<any>(null);
  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [pipelineTarget, setPipelineTarget] = useState<any>(null);
  const [pipelineStage, setPipelineStage] = useState(pipelineStages[0]);

  const selectedJob = mockJobs.find((j) => j.id === selectedJobId)!;

  const candidatesWithScore = mockCandidates
    .map((c) => {
      const { score, matched, missing, expMatch, eduMatch } = getMatchScore(
        c,
        selectedJob
      );
      return { ...c, score, matched, missing, expMatch, eduMatch };
    })
    .sort((a, b) => b.score - a.score);

  const toggleShortlist = (id: string) => {
    setShortlisted((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10 px-2">
      <div className="w-full mx-auto">
        <h1 className="text-3xl font-bold text-[#011F72] mb-8">CV Matching</h1>
        <div className="mb-6">
          <label className="block font-medium mb-2 text-[#011F72]">
            Select Job
          </label>
          <button
            className="text-blue-600 hover:underline text-lg font-semibold mb-2"
            onClick={() => setShowJobModal(true)}
          >
            {selectedJob.title}
          </button>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="border rounded-[10px] px-3 py-2 w-full focus:ring-2 focus:ring-blue-200"
          >
            {mockJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
        <div className="bg-white rounded-[12px] shadow p-6 flex flex-col gap-4">
          {candidatesWithScore.length === 0 ? (
            <div className="text-gray-400 text-xs text-center">
              No candidates found
            </div>
          ) : (
            candidatesWithScore.map((c) => (
              <div
                key={c.id}
                className="mb-4 last:mb-0 bg-blue-50 rounded-[12px] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#011F72] flex items-center gap-2 flex-wrap">
                    {c.name}
                    {shortlisted.includes(c.id) && (
                      <span className="bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-semibold">
                        Shortlisted
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    Skills: {c.skills.join(", ")}
                  </div>
                  <div className="text-xs text-gray-600">
                    Experience: {c.experience} yrs
                  </div>
                  <div className="text-xs text-gray-600">
                    Education: {c.education}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs mt-2">
                    {c.matched.length > 0 && (
                      <span className="text-green-700">
                        Matched: {c.matched.join(", ")}
                      </span>
                    )}
                    {c.missing.length > 0 && (
                      <span className="text-red-600">
                        Missing: {c.missing.join(", ")}
                      </span>
                    )}
                    {c.expMatch ? (
                      <span className="text-green-700">Experience matched</span>
                    ) : (
                      <span className="text-red-600">Experience missing</span>
                    )}
                    {c.eduMatch ? (
                      <span className="text-green-700">Education matched</span>
                    ) : (
                      <span className="text-red-600">Education missing</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[120px] items-end sm:items-center">
                  <div className="w-32 bg-blue-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                  <span className="font-bold text-blue-700 text-sm min-w-[32px]">
                    {c.score}%
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2 justify-end sm:justify-center">
                    <button
                      className="flex items-center gap-1 px-2 py-1 rounded bg-white border border-blue-100 text-blue-700 hover:bg-blue-50 transition text-xs"
                      onClick={() => {
                        setModalCandidate(c);
                        setShowCandidateModal(true);
                      }}
                    >
                      <Eye size={16} /> View
                    </button>
                    <button
                      className={`flex items-center gap-1 px-2 py-1 rounded bg-white border ${
                        shortlisted.includes(c.id)
                          ? "border-green-300 text-green-700 bg-green-50"
                          : "border-blue-100 text-blue-700"
                      } hover:bg-green-50 transition text-xs`}
                      onClick={() => toggleShortlist(c.id)}
                    >
                      <Star size={16} />{" "}
                      {shortlisted.includes(c.id) ? "Unshortlist" : "Shortlist"}
                    </button>
                    <button
                      className="flex items-center gap-1 px-2 py-1 rounded bg-white border border-blue-100 text-blue-700 hover:bg-blue-50 transition text-xs"
                      onClick={() => {
                        setMessageTarget(c);
                        setShowMessageModal(true);
                      }}
                    >
                      <MessageCircle size={16} /> Message
                    </button>
                    <button
                      className="flex items-center gap-1 px-2 py-1 rounded bg-white border border-blue-100 text-indigo-700 hover:bg-indigo-50 transition text-xs"
                      onClick={() => {
                        setPipelineTarget(c);
                        setShowPipelineModal(true);
                      }}
                    >
                      <ArrowRight size={16} /> Pipeline
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Candidate Details Modal */}
        {showCandidateModal && modalCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition animate-fadeInModal">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-blue-100 animate-scaleIn">
              <h2 className="text-xl font-bold mb-4 text-[#011F72]">
                Candidate Details
              </h2>
              <div className="mb-2">
                <span className="font-semibold">Name:</span>{" "}
                {modalCandidate.name}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Skills:</span>{" "}
                {modalCandidate.skills.join(", ")}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Experience:</span>{" "}
                {modalCandidate.experience} yrs
              </div>
              <div className="mb-2">
                <span className="font-semibold">Education:</span>{" "}
                {modalCandidate.education}
              </div>
              <div className="flex gap-4 justify-end mt-4">
                <button
                  onClick={() => setShowCandidateModal(false)}
                  className="px-4 py-2 rounded-[10px] bg-gray-200 hover:bg-gray-300 transition"
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 rounded-[10px] bg-green-600 text-white hover:bg-green-700 transition"
                  onClick={() => toggleShortlist(modalCandidate.id)}
                >
                  {shortlisted.includes(modalCandidate.id)
                    ? "Unshortlist"
                    : "Shortlist"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Job Details Modal */}
        {showJobModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition animate-fadeInModal">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-blue-100 animate-scaleIn">
              <h2 className="text-xl font-bold mb-4 text-[#011F72]">
                Job Details
              </h2>
              <div className="mb-2">
                <span className="font-semibold">Title:</span>{" "}
                {selectedJob.title}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Required Skills:</span>{" "}
                {selectedJob.requiredSkills.join(", ")}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Required Experience:</span>{" "}
                {selectedJob.requiredExperience} yrs
              </div>
              <div className="mb-2">
                <span className="font-semibold">Required Education:</span>{" "}
                {selectedJob.requiredEducation}
              </div>
              <div className="flex gap-4 justify-end mt-4">
                <button
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 rounded-[10px] bg-gray-200 hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Message Modal */}
        {showMessageModal && messageTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition animate-fadeInModal rounded-[10px]">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-blue-100 animate-scaleIn">
              <h2 className="text-xl font-bold mb-4 text-[#011F72]">
                Message {messageTarget.name}
              </h2>
              <textarea
                className="border rounded-[10px] px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 mb-4"
                rows={4}
                placeholder="Type your message..."
              />
              <div className="flex gap-4 justify-end mt-2">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 rounded-[10px] bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 rounded-[10px] bg-blue-600 text-white hover:bg-blue-700 transition font-semibold"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Move to Pipeline Modal */}
        {showPipelineModal && pipelineTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition animate-fadeInModal rounded-[10px]">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-blue-100 animate-scaleIn">
              <h2 className="text-xl font-bold mb-4 text-[#011F72]">
                Move {pipelineTarget.name} to Pipeline
              </h2>
              <label className="block font-medium mb-2">Select Stage</label>
              <select
                value={pipelineStage}
                onChange={(e) => setPipelineStage(e.target.value)}
                className="border rounded-[10px] px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 mb-4"
              >
                {pipelineStages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="flex gap-4 justify-end mt-2">
                <button
                  onClick={() => setShowPipelineModal(false)}
                  className="px-4 py-2 rounded-[10px] bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // For demo, just close modal. In real app, add to pipeline.
                    setShowPipelineModal(false);
                  }}
                  className="px-4 py-2 rounded-[10px] bg-blue-600 text-white hover:bg-blue-700 transition font-semibold"
                >
                  Move
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
