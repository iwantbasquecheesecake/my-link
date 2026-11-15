"use client";

import React, { useRef, useState } from "react";
import {
  MapPin,
  Mail,
  CheckCircle2,
  Pencil,
  Trash2,
  Check,
  X,
  Plus,
} from "lucide-react";
import { ProfileConfig } from "@/types/mylink";
import { UserProfile } from "@/lib/firebase-auth";
import { LineGithubIcon } from "./icon-helper";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DeleteBioModal } from "./profile-edit-modals";
import { EditProfileModal } from "./edit-profile-modal";

interface ProfileHeaderProps {
  profile: ProfileConfig;
  userProfile?: UserProfile | null;
  isLoggedIn?: boolean;
  onSecretTrigger: () => void;
  onUpdateProfile?: (
    updates: Partial<Pick<UserProfile, "bio" | "name" | "role">>
  ) => Promise<void> | void;
  onSaveProfile?: (data: {
    username: string;
    displayName: string;
    role: string;
  }) => Promise<void>;
}

export function ProfileHeader({
  profile,
  userProfile,
  isLoggedIn = false,
  onSecretTrigger,
  onUpdateProfile,
  onSaveProfile,
}: ProfileHeaderProps) {
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);

  // 모달 상태 관리
  const [isDeleteBioOpen, setIsDeleteBioOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // 말풍선 인라인 편집 상태
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [isSavingBio, setIsSavingBio] = useState(false);

  const handleAvatarClick = () => {
    const now = Date.now();
    if (now - lastClickTimeRef.current < 500) {
      clickCountRef.current += 1;
    } else {
      clickCountRef.current = 1;
    }
    lastClickTimeRef.current = now;

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      onSecretTrigger();
    }
  };

  // 로그인 사용자 또는 전달된 userProfile 정보 우선 적용
  const currentEmail = userProfile?.email || profile.email;
  const emailPrefix = currentEmail ? currentEmail.split("@")[0] : "user";

  // displayName: 가입 시 이메일 앞부분 기반 고유 URL 식별자 (예: narin31005)
  const currentDisplayName =
    userProfile?.displayName || (isLoggedIn ? emailPrefix : (profile.englishName || "user"));

  // username: 사용자가 자유롭게 바꿀 수 있는 별명(닉네임) (예: 나린, 아무개)
  const currentUsername =
    userProfile?.username || userProfile?.name || (isLoggedIn ? emailPrefix : profile.name);

  // 프로필 사진: 구글 계정 프로필 사진(photoURL) 우선, 없으면 기본 avatarUrl
  const currentAvatarUrl = userProfile?.photoURL || profile.avatarUrl;
  const currentRole =
    userProfile?.role || (isLoggedIn ? "MyLink 크리에이터" : profile.role);
  const currentBio = userProfile?.bio !== undefined ? userProfile.bio : profile.bio;

  // 말풍선 저장 처리
  const handleSaveBio = async () => {
    if (!onUpdateProfile) return;
    try {
      setIsSavingBio(true);
      await onUpdateProfile({ bio: bioDraft.trim() });
      setIsEditingBio(false);
    } catch (error) {
      console.error("말풍선 소개글 저장 실패:", error);
    } finally {
      setIsSavingBio(false);
    }
  };

  // 말풍선 삭제 처리
  const handleConfirmDeleteBio = async () => {
    if (!onUpdateProfile) return;
    await onUpdateProfile({ bio: "" });
  };

  return (
    <>
      <Card className="rounded-[20px] p-5 sm:p-6 border-border shadow-gs-card relative overflow-hidden bg-card text-card-foreground">
        {/* 포레스트 에코 상단 브랜드 액센트 라인 */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1E3024] via-[#4D6E56] to-[#00431C]" />

        {/* 1. 프로필 사진이 말하는 듯한 유동적 크기의 소개글 말풍선 */}
        {isEditingBio ? (
          /* 말풍선 인라인 편집 모드: 글자 수에 맞게 크기가 유동적으로 조절 */
          <div className="mb-4 flex flex-col items-center sm:items-start pt-1 animate-in fade-in duration-200">
            <div className="relative w-full max-w-full p-3.5 rounded-2xl bg-[#D6E1D8]/80 dark:bg-[#273A2D]/90 border border-[#4D6E56]/40 shadow-xs">
              <textarea
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                placeholder="말풍선에 띄울 자기소개를 입력해주세요 (최대 100자)"
                maxLength={100}
                rows={Math.min(5, Math.max(2, Math.ceil(bioDraft.length / 28)))}
                autoFocus
                className="w-full text-xs sm:text-[13px] bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none leading-relaxed break-all [overflow-wrap:anywhere]"
              />
              <div className="flex items-center justify-between pt-2 border-t border-[#4D6E56]/20">
                <span className="text-[10px] text-muted-foreground font-medium">
                  {bioDraft.length}/100자
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsEditingBio(false)}
                    disabled={isSavingBio}
                    className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-semibold text-muted-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>취소</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBio}
                    disabled={isSavingBio}
                    className="inline-flex items-center gap-1 h-6 px-2.5 rounded-md text-[11px] font-bold bg-[#4D6E56] hover:bg-[#3D5744] text-[#F4FBF4] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>저장</span>
                  </button>
                </div>
              </div>
              {/* 말풍선 아래쪽 꼬리 (아바타 가리킴) */}
              <div className="absolute -bottom-2 left-1/2 sm:left-11 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#D6E1D8]/90 dark:border-t-[#273A2D]" />
            </div>
          </div>
        ) : currentBio ? (
          /* 말풍선 읽기 모드: 내용 길이에 맞춰 가로/세로 크기가 자유자재로 확장 */
          <div className="mb-4 flex flex-col items-center sm:items-start pt-1">
            <div className="relative inline-block w-fit max-w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-[#D6E1D8]/65 dark:bg-[#273A2D]/85 border border-[#4D6E56]/30 dark:border-[#4D6E56]/40 shadow-xs text-xs sm:text-[13px] text-foreground leading-relaxed animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* 본문 텍스트: 글자가 아무리 길어도 밖으로 삐져나가지 않고 자연스럽게 줄바꿈 */}
                <div className="min-w-0 flex-1 break-all [overflow-wrap:anywhere]">
                  <p className="font-medium inline">
                    <span className="text-[#4D6E56] font-bold text-sm leading-none font-serif select-none mr-1">“</span>
                    <span className="break-all [overflow-wrap:anywhere]">{currentBio}</span>
                    <span className="text-[#4D6E56] font-bold text-sm leading-none font-serif select-none ml-1">”</span>
                  </p>
                </div>

                {/* 로그인 상태 전용 말풍선 수정/삭제 버튼 */}
                {isLoggedIn && (
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center pt-0.5 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => {
                        setBioDraft(currentBio);
                        setIsEditingBio(true);
                      }}
                      className="inline-flex items-center gap-0.5 h-6 px-2 rounded-md text-[11px] font-semibold text-[#4D6E56] bg-[#4D6E56]/10 hover:bg-[#4D6E56] hover:text-[#F4FBF4] border border-[#4D6E56]/25 transition-all cursor-pointer shadow-2xs active:scale-95"
                      title="자기소개 말풍선 수정"
                    >
                      <Pencil className="w-2.5 h-2.5 stroke-[2.2]" />
                      <span>수정</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDeleteBioOpen(true)}
                      className="inline-flex items-center gap-0.5 h-6 px-2 rounded-md text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-600 hover:text-white border border-red-200 dark:border-red-900/50 transition-all cursor-pointer shadow-2xs active:scale-95"
                      title="자기소개 말풍선 삭제"
                    >
                      <Trash2 className="w-2.5 h-2.5 stroke-[2.2]" />
                      <span>삭제</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 말풍선 아래쪽 꼬리 (아바타 가리킴) */}
              <div className="absolute -bottom-2 left-1/2 sm:left-11 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#D6E1D8]/90 dark:border-t-[#273A2D]" />
            </div>
          </div>
        ) : (
          /* 자기소개가 비어있을 때 (로그인 사용자 전용 추가 버튼) */
          isLoggedIn && (
            <div className="mb-3 flex justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => {
                  setBioDraft("");
                  setIsEditingBio(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-[#4D6E56]/50 hover:border-[#4D6E56] hover:bg-[#4D6E56]/5 text-xs font-semibold text-[#4D6E56] transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>말풍선 자기소개 추가</span>
              </button>
            </div>
          )
        )}

        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4 sm:gap-5">
          {/* 아바타 영역: 구글 계정 프로필로 통일 */}
          <div className="relative group shrink-0">
            <button
              type="button"
              onClick={handleAvatarClick}
              className="rounded-full border border-border/80 hover:border-[#4D6E56] transition-transform duration-300 active:scale-95 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#4D6E56]"
              title="프로필 사진 (구글 계정 프로필)"
              aria-label={`${currentUsername} 프로필 사진`}
            >
              <Avatar size="xl">
                <AvatarImage
                  src={currentAvatarUrl || "/avatar.svg"}
                  alt={currentUsername}
                  priority
                />
                <AvatarFallback>{currentUsername.slice(0, 2)}</AvatarFallback>
              </Avatar>
            </button>
            <span
              className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ring-2 shadow-xs ${
                isLoggedIn
                  ? "bg-[#4D6E56] ring-[#4D6E56]/30"
                  : "bg-gray-400 ring-gray-400/30"
              }`}
            />
          </div>

          {/* 프로필 정보 */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            {/* 1. 메인: 사용자가 설정한 별명 (Username) & 프로필 수정 버튼 */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-1.5">
                <span>{currentUsername}</span>
                {isLoggedIn && (
                  <span title="Google 인증 완료 계정" className="inline-flex text-[#4D6E56]">
                    <CheckCircle2 className="w-4 h-4 ml-0.5" />
                  </span>
                )}
              </h1>

              {/* 로그인 상태 전용 프로필 정보(별명) 수정 버튼 */}
              {isLoggedIn && onSaveProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-semibold text-[#4D6E56] bg-[#4D6E56]/10 hover:bg-[#4D6E56] hover:text-[#F4FBF4] border border-[#4D6E56]/25 transition-all cursor-pointer shadow-2xs active:scale-95"
                  title="별명(Username) 수정"
                >
                  <Pencil className="w-2.5 h-2.5 stroke-[2.2]" />
                  <span>프로필 수정</span>
                </button>
              )}
            </div>

            {/* 2. 서브: 고유 주소 ID (Display Name) */}
            {currentDisplayName && (
              <p className="text-xs sm:text-[13px] font-semibold text-muted-foreground flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <span className="text-[#4D6E56] dark:text-[#8FA594] font-mono">@{currentDisplayName}</span>
              </p>
            )}

            <p className="text-xs sm:text-sm font-medium text-[#4D6E56] dark:text-[#8FA594] mt-0.5">
              {currentRole}
            </p>

            {/* 메타 정보 (위치 & 이메일) */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-muted-foreground">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#4D6E56]" />
                  {profile.location}
                </span>
              )}
              {currentEmail && (
                <a
                  href={`mailto:${currentEmail}`}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#4D6E56]" />
                  {currentEmail}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 소셜 링크 아이콘 바 */}
        <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-center sm:justify-start gap-2">
          {profile.socials.github && (
            <a
              href={profile.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-[#4D6E56] hover:text-[#F4FBF4] hover:border-[#4D6E56] transition-all duration-200 active:scale-95 shadow-xs"
              title="GitHub 방문"
              aria-label="GitHub 프로필"
            >
              <LineGithubIcon className="w-5 h-5" />
            </a>
          )}

          {profile.socials.linkedin && (
            <a
              href={profile.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-[#4D6E56] hover:text-[#F4FBF4] hover:border-[#4D6E56] transition-all duration-200 active:scale-95 shadow-xs"
              title="LinkedIn 방문"
              aria-label="LinkedIn 프로필"
            >
              <span className="font-bold text-xs">in</span>
            </a>
          )}

          {profile.socials.blog && (
            <a
              href={profile.socials.blog}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-[#4D6E56] hover:text-[#F4FBF4] hover:border-[#4D6E56] transition-all duration-200 active:scale-95 shadow-xs font-bold text-[10px]"
              title="기술 블로그 방문"
              aria-label="기술 블로그"
            >
              VELOG
            </a>
          )}

          {currentEmail && (
            <a
              href={`mailto:${currentEmail}`}
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-[#4D6E56] hover:text-[#F4FBF4] hover:border-[#4D6E56] transition-all duration-200 active:scale-95 shadow-xs"
              title="이메일 보내기"
              aria-label="이메일 연락"
            >
              <Mail className="w-4 h-4" />
            </a>
          )}
        </div>
      </Card>

      {/* 자기소개 말풍선 삭제 모달 */}
      <DeleteBioModal
        isOpen={isDeleteBioOpen}
        onClose={() => setIsDeleteBioOpen(false)}
        onConfirm={handleConfirmDeleteBio}
      />

      {/* 프로필 정보 (별명 Username, 직업 Role, 고유 주소 Display Name) 수정 모달 */}
      {isLoggedIn && onSaveProfile && userProfile && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          currentUsername={userProfile.username || emailPrefix}
          currentDisplayName={userProfile.displayName || emailPrefix}
          currentRole={userProfile.role || "MyLink 크리에이터"}
          currentUid={userProfile.uid}
          currentEmail={currentEmail}
          onSave={onSaveProfile}
        />
      )}
    </>
  );
}
