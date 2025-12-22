# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

"별길상조" 장례 서비스 회사의 정적 단일 페이지 웹사이트입니다. 서비스 정보 제공, 비용 견적 양식, 고객 리뷰 및 연락처 정보를 표시합니다.

## 빌드 및 실행

정적 웹사이트이므로 별도의 빌드 과정이 없습니다. 웹 브라우저에서 `index.html` 파일을 직접 열면 됩니다.

## 아키텍처

- **단일 파일 구조**: 전체 웹사이트가 `index.html` 한 파일에 포함
- **인라인 CSS**: 모든 스타일은 `<head>` 내 `<style>` 블록에 작성
- **JavaScript 없음**: 순수 HTML/CSS만 사용
- **CSS 변수**: `:root`에서 테마 색상과 폰트 정의 (--primary-color, --secondary-color 등)
- **반응형 디자인**: 미디어 쿼리로 768px, 968px 브레이크포인트 처리

## 주요 섹션

- 헤더 (고정 네비게이션)
- 히어로 섹션
- 장례 비용 견적 폼
- 서비스 안내
- 상품 안내 (무빈소장, 일반장)
- 별길의 약속
- 고객 후기
- 연락처
- 푸터

## 이미지 파일

`images/` 폴더에 PNG 이미지 파일들(1.png ~ 9.png)이 있으며 서비스 아이콘과 히어로 이미지로 사용됩니다.
