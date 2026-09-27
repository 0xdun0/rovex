export {
  WarningCircle as AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowsDownUp as ArrowUpDown,
  Medal as Award,
  TextB as Bold,
  Bomb,
  BookOpen, // icone de documentacao e guias
  Buildings as Building,
  CalendarDots as CalendarClock,
  CalendarBlank as CalendarIcon,
  CalendarBlank as Calendar, // icone de calendario para datas
  Clock, // icone de relogio para frequencia
  ArrowsClockwise as RefreshCw, // icone de ciclo recorrente
  Check,

  CheckCircle,
  CircleNotch as Loader2,
  CheckSquare,
  CaretDown as ChevronDown,
  CaretLeft as ChevronLeft,
  CaretRight as ChevronRight,
  CaretUpDown as ChevronsUpDown,
  CaretUp as ChevronUp,
  Circle,
  Code,
  Copy,
  Cpu,
  HardDrive,
  Lock,
  Terminal,
  PencilSimple as Edit,
  Eye,
  EyeSlash as EyeOff,
  EnvelopeSimple as Mail, // icone de email
  Stack as Layers, // icone de camadas
  File,
  FileCode,
  FileDoc,
  FileArrowDown as FileDown,
  FilePlus as FilePlus2,
  FileText,
  FileArrowUp as FileUp,
  Kanban as FolderKanban,
  Images as GalleryHorizontal,
  Globe,
  GridFour,
  ShieldWarning,
  ShieldWarning as ShieldAlert,
  SlidersHorizontal as Sliders,
  ArrowCounterClockwise as RotateCcw,
  Sparkle as Sparkles,
  DotsSixVertical as GripVertical,
  TextHOne as Heading1,
  TextHTwo as Heading2,
  TextHThree as Heading3,
  TextHFour as Heading4,
  ClockCounterClockwise as History,
  House as Home,
  Image,
  Image as ImageIcon,
  TextItalic as Italic,
  Key as KeyRound,
  Translate as Languages,
  Layout as LayoutTemplate,
  Link,
  List,
  ListBullets,
  ListNumbers,
  ListNumbers as ListOrdered,
  Minus,
  Moon,
  Network,
  Palette,
  PlugsConnected,
  PlugsConnected as Mcp,
  Sidebar as PanelLeft,
  Plus,
  PlusCircle,
  Printer,
  Quotes as Quote,
  Rows,
  FloppyDisk as Save,
  Scan,
  MagnifyingGlass as Search,
  Gear as Settings,
  ShieldCheck,
  Shield as ShieldHalf,
  ShieldPlus,
  DeviceMobile as Smartphone,
  TextStrikethrough as Strikethrough,
  Sun,
  Table,
  TextT as Text,
  SignOut as LogOut, // icone de logout
  ArrowSquareOut as ExternalLink, // icone de link externo
  Pulse as Activity, // icone de atividade/pulso
  Crosshair,
  FolderOpen,
  DotsThreeVertical as MoreVertical,
  Warning as AlertTriangle,
  Trash as Trash2,
  Upload,
  User,
  Users,
  WifiHigh as Wifi,
  TextAlignLeft as WrapText,
  X,
} from '@phosphor-icons/react/dist/ssr';

// icone oficial do command nerd font (󰘳 / nf-md-apple_keyboard_command / tecla command ⌘)
export function CommandPaletteIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M6,2A4,4 0 0,1 10,6V8H14V6A4,4 0 0,1 18,2A4,4 0 0,1 22,6A4,4 0 0,1 18,10H16V14H18A4,4 0 0,1 22,18A4,4 0 0,1 18,22A4,4 0 0,1 14,18V16H10V18A4,4 0 0,1 6,22A4,4 0 0,1 2,18A4,4 0 0,1 6,14H8V10H6A4,4 0 0,1 2,6A4,4 0 0,1 6,2M16,18A2,2 0 0,0 18,20A2,2 0 0,0 20,18A2,2 0 0,0 18,16H16V18M14,10H10V14H14V10M6,16A2,2 0 0,0 4,18A2,2 0 0,0 6,20A2,2 0 0,0 8,18V16H6M8,6A2,2 0 0,0 6,4A2,2 0 0,0 4,6A2,2 0 0,0 6,8H8V6M18,8A2,2 0 0,0 20,6A2,2 0 0,0 18,4A2,2 0 0,0 16,6V8H18Z" />
    </svg>
  );
}

