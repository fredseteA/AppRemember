import { useState, useEffect, useRef, useCallback } from 'react';
import { Link} from 'react-router-dom';
import SecurityBadge from '../components/SecurityBadge';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Star, MessageSquarePlus, User} from 'lucide-react';
import ReviewForm from '../components/ReviewForm';
import axios from 'axios';
