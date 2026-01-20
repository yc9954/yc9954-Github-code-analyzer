import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('=== AuthCallback Component Mounted ===');
    // 현재 URL 전체 확인
    console.log('AuthCallback - Current URL:', window.location.href);
    console.log('AuthCallback - Pathname:', window.location.pathname);
    console.log('AuthCallback - Search:', window.location.search);
    console.log('AuthCallback - Origin:', window.location.origin);
    
    // URL에서 토큰 추출 (여러 방법 시도)
    let accessToken: string | null = null;
    let refreshToken: string | null = null;
    
    // 방법 1: searchParams에서 추출 (일반적인 경우)
    accessToken = searchParams.get('accessToken');
    refreshToken = searchParams.get('refreshToken');
    
    // 방법 2: searchParams에 없으면 URL에서 직접 추출
    if (!accessToken || !refreshToken) {
      try {
        const urlObj = new URL(window.location.href);
        accessToken = accessToken || urlObj.searchParams.get('accessToken');
        refreshToken = refreshToken || urlObj.searchParams.get('refreshToken');
      } catch (e) {
        console.error('Error parsing URL:', e);
      }
    }
    
    // 방법 3: 해시(#) 뒤에 토큰이 있는 경우 (일부 OAuth 플로우)
    if (!accessToken || !refreshToken) {
      const hash = window.location.hash.substring(1);
      if (hash) {
        const hashParams = new URLSearchParams(hash);
        accessToken = accessToken || hashParams.get('accessToken');
        refreshToken = refreshToken || hashParams.get('refreshToken');
      }
    }
    
    const type = searchParams.get('type'); // installation 체크용
    const installationId = searchParams.get('installation_id');
    const setupAction = searchParams.get('setup_action');

    console.log('AuthCallback - Processing:', {
      accessToken: accessToken ? 'present' : 'missing',
      refreshToken: refreshToken ? 'present' : 'missing',
      type,
      installationId,
      setupAction,
      allParams: Object.fromEntries(searchParams.entries()),
    });

    // Case A: 로그인 성공 (토큰이 있는 경우)
    if (accessToken && refreshToken) {
      // 토큰 저장 (LocalStorage)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      console.log('로그인 성공! Repository 페이지로 이동합니다.');
      
      // URL 파라미터 제거 (보안)
      window.history.replaceState({}, '', '/repository');
      
      // 토큰 저장 후 Repository 페이지로 이동
      navigate('/repository', { replace: true });
      return;
    }

    // Case B: accessToken만 있는 경우 (refreshToken이 없을 수도 있음)
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      console.log('AccessToken 저장 완료! Repository 페이지로 이동합니다.');
      window.history.replaceState({}, '', '/repository');
      navigate('/repository', { replace: true });
      return;
    }

    // Case C: GitHub App 설치 완료
    if (type === 'installation' && installationId && setupAction === 'install') {
      console.log(`앱 설치 완료: ${installationId}`);
      
      // URL 파라미터 제거
      window.history.replaceState({}, '', '/repository');
      
      // 설치 완료 후 Repository 페이지로 이동
      navigate('/repository', { replace: true });
      return;
    }
    
    // 예외 처리: 인증 정보가 없는 경우
    console.error('인증 정보가 없습니다. 로그인 페이지로 이동합니다.');
    window.history.replaceState({}, '', '/login');
    navigate('/login', { replace: true });
  }, [searchParams, navigate]);

  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg mb-2">로그인 처리 중...</div>
        <div className="text-sm text-gray-400">잠시만 기다려주세요.</div>
      </div>
    </div>
  );
}
