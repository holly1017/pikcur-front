import React, { useEffect, useRef, useState } from 'react';
import BaseLayout from '../../components/layout/BaseLayout';
import GoodsGallery from './Component/GoodsGallery';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Typography } from '@mui/material';
import CustomAvatar from '../../components/common/CustomAvatar';
import ReviewSummary from '../../components/common/ReviewSummary';
import CustomTable from '../../components/common/CustomTable';
import CustomModal from '../../components/common/CustomModal';
import {
    faBan, faHeart as faHeartSolid
} from '@fortawesome/free-solid-svg-icons';
import { ManageModalHandle } from '../Auth/SignUp/component/TermsOfServiceModal';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { stompClient, api } from '../../common/api';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { useAuth } from '../../context/AuthContext';
import PaginationButtons from '../../components/common/PaginationButtons';
import BuyoutPayment from '../Payment/BuyoutPayment';

const API_BASE_URL = process.env.REACT_APP_API_URL;

interface StoreInfo {
    imagePath: string;
    storeName: string;
    averageRating: number;
    storeId: number;
    reviewCount: number;
}
interface GoodsDetail {
    brandId: number;
    brandName: string;
    categoryPath: string;
    goodsName: string;
    currentBidPrice: number;
    buyoutPrice: number;
    startPrice: number;
    shippingPrice: number;
    quality: string;
    auctionEndDate: string;
    size: string;
    liked: boolean;
    goodsInfo: string;
    goodsId: number;
    imageList: string[];
    statusName: string;
    storeInfo: StoreInfo;

}

interface QuestionItem {
    questionId: number;
    title: string;
    answer: boolean;
    createDate: string;
    public: boolean;
}


/**
 * 
 * 상품 상세 페이지
 */
const GoodsDetail: React.FC = () => {
    // const params = useParams<{ goodsId: string }>();
    // const goodsId = Number(params.goodsId);

    const { isAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const reportModalRef = useRef<any>(null);
    const [goods, setGoods] = useState<GoodsDetail>();
    const [questionList, setQuestionList] = useState<QuestionItem[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // 즉시결제 모달 정보
    const [buyerName, setBuyerName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [detailAddress, setDetailAddress] = useState('');
    const [payPrice, setPayPrice] = useState(0);
    const payModalRef = useRef<ManageModalHandle>(null);

    useEffect(() => {
        if (window.IMP) {
            window.IMP.init('imp57185518'); // ⚠️ 가맹점 식별코드
        } else {
            console.error("window.IMP를 찾지 못했습니다. index.html을 확인하세요.");
        }
    }, []);

    const handlePay = () => {
        console.log('--- handlePay 함수 시작 ---');

        const IMP = window.IMP;
        if (!IMP) {
            console.error('❌ 결제 중단: 아임포트(IMP) 로드 실패');
            alert('아임포트 로드 실패');
            return;
        }

        console.log('아임포트에 결제 요청을 보냅니다...');

        IMP.request_pay(
            {
                pg: 'html5_inicis',
                pay_method: 'card',
                merchant_uid: `mid_${new Date().getTime()}`,
                name: goods?.goodsName,
                amount: payPrice,
                buyer_name: buyerName,
                buyer_tel: phone,
                buyer_addr: `${address} ${detailAddress}`,
            },
            (rsp: any) => {
                if (rsp.success) {
                    console.log('✅ 아임포트 결제 성공!', rsp);
                    alert('✅ 결제가 완료되었습니다.\n결제번호: ' + rsp.imp_uid);
                    payModalRef.current?.closeModal();

                    console.log('이제 백엔드로 fetch 요청을 보냅니다...');

                    api.post(`/payment/verify`, {
                        impUid: rsp.imp_uid,
                        merchantUid: rsp.merchant_uid,
                        amount: payPrice,
                        goodsId: goods?.goodsId,
                    })
                        .then((res) => {
                            console.log("서버 응답:", res);

                            if (res.status !== "success") {
                                throw new Error('결제 검증 실패');
                            }

                            alert(res.message);
                        })
                        .catch((err) => {
                            console.error(' .catch 에러:', err);
                            alert(err.message);
                        });

                } else {
                    console.error('❌ 아임포트 결제 실패!', rsp);
                    alert('❌ 결제가 실패하였습니다: ' + rsp.error_msg);
                }
            }
        );
    };

    const handleGoodsReport = () => {
        if (location.state.goodsId) {
            const goodsId = location.state.goodsId;
            api.post(`/goods/report/${goodsId}`)
                .then((res) => {
                    alert('신고 처리 로직 실행');
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    }

    const formattedQuestionList = questionList.map((q, index) => ({
        questionId: q.questionId,
        title: q.title,
        createDate: q.createDate.substring(0, 10),
        answer: (
            <Typography fontWeight="bold">
                {q.answer ? "답변 완료" : "답변 대기"}
            </Typography>
        ),
    }));

    const openAddressPopup = () => {
        if (window.daum && window.daum.Postcode) {
            new window.daum.Postcode({
                oncomplete: function (data: any) {
                    const fullAddress = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
                    setAddress(fullAddress);
                }
            }).open();
        } else {
            alert('주소 검색 서비스를 불러올 수 없습니다.');
        }
    };

    useEffect(() => {
        if (location.state.goodsId) {
            const goodsId = location.state.goodsId;

            // 실시간 입찰가 업데이트: 해당 상품 채널을 구독합니다.
            // 다른 사용자가 입찰하면 현재 입찰가가 새로고침 없이 즉시 갱신됩니다.
            const subscription = stompClient.subscribe(`/topic/goods/${goodsId}`, (message: any) => {
                const newBid = JSON.parse(message.body);
                setGoods(prev => prev ? { ...prev, currentBidPrice: newBid.bidPrice } : prev);
            });

            api.get(`/goods/${goodsId}`)
                .then((res) => {
                    console.log(res);
                    setGoods(res);
                })
                .catch((err) => {
                    console.log("🔥 에러:", err);
                });

            api.get(`/goods/${goodsId}/questions`, { currentPage })
                .then((res) => {
                    console.log(res);
                    setQuestionList(res.questionList);
                    setTotalPages(res.totalPages || 1);
                })
                .catch((err) => {
                    console.log("🔥 에러:", err);
                });

            // 페이지 이탈 시 구독 해제 (메모리 누수 방지)
            return () => subscription.unsubscribe();
        }
    }, []);

    const handleStoreDetail = (storeId: number) => {
        navigate("/storeDetail", { state: { storeId } });
    }
    const handleQuestionForm = (goodsId: number) => {
        navigate("/questionForm", { state: { goodsId } });
    }
    const handleQuestionDetail = (questionId: number) => {
        navigate("/questionDetail", { state: { questionId } });
    }

    const handleHeartClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const goodsId = goods?.goodsId;

        if (goods?.liked) {
            if (isAuth) {
                api.delete(`/goods/like/${goodsId}`)
                    .then(() => {
                        updateLikeState(false);
                    })
                    .catch((err) => console.log("🔥 에러:", err));
            } else {
                alert("로그인이 필요합니다.");
            }
        } else {
            if (isAuth) {
                api.post(`/goods/like/${goodsId}`)
                    .then(() => {
                        updateLikeState(true);
                    })
                    .catch((err) => console.log("🔥 에러:", err));
            } else {
                alert("로그인이 필요합니다.");
            }
        }
    };

    const updateLikeState = (status: boolean) => {
        setGoods(prevGoods => {
            if (prevGoods) {
                return {
                    ...prevGoods,
                    liked: status
                };
            }
            return prevGoods;
        });
    };
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBidPage = (goodsId: number) => {
        navigate("/bidRegister", { state: { goodsId } })
    }

    return (
        <>
            <BaseLayout
                content={
                    <div style={{ marginLeft: '80px', marginRight: '80px' }}>
                        <div style={{ height: '30px', marginBottom: 14, fontSize: 16, fontWeight: 'normal', color: '#141414' }}>HOME &gt; 아우터 &gt; 자켓 &gt; 가죽자켓</div>
                        <div style={{ height: '508px', display: 'flex', overflow: 'hidden', borderBottom: '1px solid #F2F2F2', paddingBottom: 30 }}>
                            <div
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: 0,
                                    overflow: 'hidden',
                                    marginRight: '20px'
                                }}
                            >
                                <GoodsGallery
                                    images={goods?.imageList ?? []} />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderBottom: '1px solid #F2F2F2' }}>
                                    <div style={{ marginBottom: 14, display: 'flex', color: '#294186', fontSize: 16 }}>
                                        {goods?.brandName}
                                    </div>
                                    <div style={{ color: '#141414', fontSize: 24 }}>{goods?.goodsName}</div>
                                </div>
                                <div style={{ flex: 3, display: 'flex', flexDirection: 'row', borderBottom: '1px solid #F2F2F2' }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: '700', color: '#141414' }}>
                                            <div>현재 입찰가</div>
                                            <div style={{ color: '#FF5050 ' }}>{goods?.currentBidPrice === null ? 0 : goods?.currentBidPrice.toLocaleString()}</div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, color: '#141414' }}>
                                            <div>즉시 입찰가</div>
                                            <div>{goods?.buyoutPrice.toLocaleString()}</div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: '#141414' }}>
                                            <div>시작가</div>
                                            <div>{goods?.startPrice.toLocaleString()}</div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: '#141414' }}>
                                            <div>배송비</div>
                                            <div>{goods?.shippingPrice.toLocaleString()}</div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: '#141414' }}>
                                            <div>상품 상태</div>
                                            <div>{goods?.quality}</div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: '#141414' }}>
                                            <div>경매 종료</div>
                                            <div>{goods?.auctionEndDate}</div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: '#141414' }}>
                                            <div>사이즈</div>
                                            <div>{goods?.size}</div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
                                        <button
                                            type="button"
                                            aria-label="신고"
                                            style={{
                                                width: 40,
                                                height: 40,
                                                border: '1px solid #E0E0E0',
                                                borderRadius: 12,
                                                background: '#FF5050',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: 0,
                                                fontSize: 12,
                                                fontWeight: 600,
                                            }}
                                            onClick={() => reportModalRef.current?.openModal()}
                                        >
                                            <FontAwesomeIcon icon={faBan} style={{ color: '#ffffff', fontSize: 20 }} />
                                        </button>
                                        <button
                                            type="button"
                                            aria-label="찜하기"
                                            style={{
                                                width: 40,
                                                height: 40,
                                                border: '1px solid #E0E0E0',
                                                borderRadius: 12,
                                                background: '#FFFFFF',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: 0
                                            }}
                                            onClick={handleHeartClick}
                                        >
                                            <FontAwesomeIcon icon={goods?.liked ? faHeartSolid : faHeartRegular} style={{ color: '#FF5050', fontSize: 22 }} />
                                        </button>
                                        <Button style={{ backgroundColor: '#141414', height: 40, width: 120, color: '#FFFFFF' }} onClick={() => handleBidPage(goods?.goodsId || 0)}>입찰</Button>
                                        <Button
                                            style={{ backgroundColor: '#F2F2F2', height: 40, width: 120, color: '#141414', border: '1px solid #D9D9D9' }}
                                            onClick={() => {

                                                const goodsId = goods?.goodsId;
                                                api.get(`/payment/buyout/${goodsId}`)
                                                    .then((res) => {
                                                        console.log(res);
                                                        setPayPrice(res.payPrice);
                                                        setBuyerName(res.receiver);
                                                        setPhone(res.phone);
                                                        setAddress(res.address);
                                                        setDetailAddress(res.addressDetail);
                                                    })
                                                    .catch((err) => {
                                                        console.log("🔥 에러:", err);
                                                    })

                                                payModalRef.current?.openModal()
                                            }}
                                        >
                                            즉시 결제
                                        </Button>
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: '74px' }}>
                                            <div style={{ marginLeft: 8 }}>
                                                <CustomAvatar src={goods?.storeInfo.imagePath} />
                                            </div>
                                            <div style={{ 'cursor': 'pointer' }}
                                                onClick={() => { handleStoreDetail(goods?.storeInfo.storeId ?? 0) }}
                                            >{goods?.storeInfo.storeName}</div>
                                            <div style={{ marginRight: 8 }}>
                                                <ReviewSummary value={goods?.storeInfo.averageRating ?? 0} reviewCnt={goods?.storeInfo.reviewCount ?? 0} storeId={goods?.storeInfo.storeId ?? 0} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: 30, minHeight: 200, fontSize: 18, borderBottom: '1px solid #F2F2F2' }}>
                            상품 설명
                            <div style={{ marginTop: 14, color: '#595959', lineHeight: '28px' }}>
                                {goods?.goodsInfo}
                            </div>
                        </div>
                        <div style={{ marginTop: 30, minHeight: 200, fontSize: 18, paddingBottom: 50 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>상점 문의</div>
                                <Button
                                    onClick={() => { handleQuestionForm(goods?.goodsId ?? 0) }}
                                    style={{ height: 35, width: 89, backgroundColor: '#141414', color: '#fff' }}>문의하기</Button>
                            </div>

                            <div style={{ marginTop: 14, marginBottom: 14 }}>
                                <CustomTable
                                    width={"100%"}
                                    columns={[
                                        { field: "title", headerName: "문의 제목" },
                                        { field: "answer", headerName: "답변 여부" },
                                        { field: "createDate", headerName: "날짜" },
                                    ]}
                                    dataList={formattedQuestionList ?? []}
                                    onRowClick={(row) => handleQuestionDetail(row.questionId)}
                                />
                            </div>
                            <PaginationButtons
                                maxPage={totalPages}
                                page={currentPage}
                                onChange={handlePageChange}></PaginationButtons>
                        </div>

                        <CustomModal
                            ref={payModalRef}
                            title="결제"
                            content={
                                <BuyoutPayment
                                    goodsName={goods?.goodsName ?? ""}
                                    payPrice={(goods?.buyoutPrice ?? 0) + (goods?.shippingPrice ?? 0)}
                                    receiver={buyerName}
                                    setReceiver={setBuyerName}
                                    phone={phone}
                                    setPhone={setPhone}
                                    address={address}
                                    setAddress={setAddress}
                                    detailAddress={detailAddress}
                                    setDetailAddress={setDetailAddress}
                                    handleAddressSearch={openAddressPopup}
                                />
                            }
                            leftButtonContent="결제하기"
                            onLeftButtonClick={handlePay}
                            height={600}
                        />
                        <CustomModal
                            ref={reportModalRef}
                            title="상품 신고"
                            content={
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', alignItems: 'center' }}>
                                    <div style={{ fontSize: 22, fontWeight: 'bold', color: '#141414', visibility: 'hidden' }}>&nbsp;</div>
                                    <div style={{ fontSize: 14, fontWeight: 'bold', color: '#757575', paddingBottom: 30 }}>{goods?.goodsName}</div>
                                    <div style={{ fontSize: 16, fontWeight: 'bold', color: '#141414' }}>해당 상품을 신고하시겠습니까?</div>
                                </div>
                            }
                            leftButtonContent="신고"
                            leftButtonColor="red"
                            onLeftButtonClick={() => {
                                handleGoodsReport()
                                reportModalRef.current?.closeModal();
                            }}
                        />
                    </div>
                }
            />
        </>
    );
};

export default GoodsDetail;