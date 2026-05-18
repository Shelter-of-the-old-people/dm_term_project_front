import type { Partner } from './types'

export const companyPartners: Partner[] = [
  {
    id: 1, kind: 'company', category: 'dev',
    name: 'w****o', type: '개인사업자',
    headline: '하나를 만들더라도 제대로 만드는 웹/업무시스템 전문 팀',
    skills: ['PHP', 'ASP.NET', 'JavaScript', 'CSS', 'C'],
    rating: 4.5, contracts: 29,
  },
  {
    id: 2, kind: 'company', category: 'design',
    name: 'z*****7', type: '개인사업자',
    headline: '판교 기반 웹디자인 스튜디오와 퍼블리싱 협업',
    skills: ['WordPress', 'Illustrator', 'Photoshop', 'Premiere'],
    rating: 4.9, contracts: 26,
  },
  {
    id: 3, kind: 'company', category: 'dev',
    name: 'o****0', type: '법인사업자',
    headline: '소프트웨어 기획, 설계, 개발, 유지보수 전문 법인',
    skills: ['Java', 'React', 'MySQL', 'Android', 'iOS'],
    rating: 4.6, contracts: 21,
  },
  {
    id: 7, kind: 'company', category: 'plan',
    name: 'h****k', type: '개인사업자',
    headline: 'UX 기획과 서비스 전략을 함께 제안하는 기획 스튜디오',
    skills: ['Figma', 'UX Research', 'Notion', 'Miro'],
    rating: 4.8, contracts: 17,
  },
]

export const freelancePartners: Partner[] = [
  {
    id: 4, kind: 'freelancer', category: 'dev',
    name: 's*****0', type: '개인프리랜서',
    headline: '웹 프론트엔드와 관리자 페이지 구축 경험이 많은 개발자',
    skills: ['JavaScript', 'CSS', 'Java', 'HTML', 'jQuery'],
    rating: 4.6, contracts: 22,
  },
  {
    id: 5, kind: 'freelancer', category: 'dev',
    name: 's****c', type: '팀프리랜서',
    headline: '웹, 앱, 서버를 함께 다루는 풀스택 팀',
    skills: ['JSP', 'Node.js', 'MySQL', 'Android', 'React.js'],
    rating: 4.6, contracts: 11,
  },
  {
    id: 6, kind: 'freelancer', category: 'plan',
    name: 'y*****g', type: '개인프리랜서',
    headline: '개발과 디자인을 함께 조율하는 웹서비스 제작 파트너',
    skills: ['Node.js', 'WordPress', 'HTML5', 'Photoshop'],
    rating: 5, contracts: 15,
  },
  {
    id: 8, kind: 'freelancer', category: 'design',
    name: 'p****3', type: '개인프리랜서',
    headline: 'UI 디자인과 프로토타이핑 전문 프리랜서',
    skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator'],
    rating: 4.7, contracts: 18,
  },
]
