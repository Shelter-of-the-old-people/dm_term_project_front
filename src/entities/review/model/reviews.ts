import type { Review } from './types'

export const reviews: Review[] = [
  {
    id: 1,
    title: '좋은 파트너를 만났습니다.',
    content:
      '기획, 디자인, 개발 범위를 명확하게 정리해주고 일정별로 진행 상황을 확인할 수 있어서 프로젝트를 안정적으로 마무리했습니다.',
    author: '방준호',
    rating: 5,
  },
  {
    id: 2,
    title: '꼼꼼하고 친절하게 봐주는 파트너',
    content:
      'IT 외주 경험이 많지 않아도 상담 매니저가 단계별로 안내해줘서 지원자 비교와 미팅 준비가 쉬웠습니다.',
    author: '포웹시스',
    rating: 5,
  },
  {
    id: 3,
    title: '프로젝트를 잘 마무리할 수 있었습니다.',
    content:
      '파트너사 찾기가 쉽지 않았는데 포트폴리오와 계약 이력을 함께 확인할 수 있어 의사결정이 빨랐습니다.',
    author: '커머스 운영사',
    rating: 4.9,
  },
]
