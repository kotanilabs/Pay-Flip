'use client'

import {  useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import {  Loader2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface RoleSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    merchantAddress: string;
}

const Pay: React.FC<RoleSelectModalProps> = ({ isOpen, onClose, merchantAddress }) => {
    const [name, setName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [amount, setAmount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [currency, setCurrency] = useState<string>('');

    if (!isOpen) return null;

    const reset = () => {
        setName('')
        setPhone('')
        setAmount(0)
        setCurrency('')
    }


    const checkTransactionStatus = async (referenceId: string) => {
        try {
            const response = await fetch(`https://sandbox-api.kotanipay.io/api/v3/onramp/fiat-to-crypto/wallet/status/${referenceId}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer eyJ1c2VyX2lkIjoiNjRlNzFhNjg4NWRiZDQ2MjkzN2JhZWJiIiwiY3JlYXRlZF9hdCI6IjIwMjQtMDktMjFUMTI6NDg6MzIuMjgyWiJ9.95d13e5d5547a9c2f86e44f4f58c2b7869e26ac0d72918cfd6a037d689312810'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to check transaction status');
            }

            const statusData = await response.json();
            return statusData.data.status === 'SUCCESSFUL';
        } catch (error) {
            console.error('Error checking transaction status:', error);
            return false;
        }
    }

    const sendToMerchantWallet = async () => {
        try {
            const response = await fetch('https://sandbox-api.kotanipay.io/api/v3/onramp/fiat-to-crypto/wallet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer eyJ1c2VyX2lkIjoiNjRlNzFhNjg4NWRiZDQ2MjkzN2JhZWJiIiwiY3JlYXRlZF9hdCI6IjIwMjQtMDktMjFUMTI6NDg6MzIuMjgyWiJ9.95d13e5d5547a9c2f86e44f4f58c2b7869e26ac0d72918cfd6a037d689312810'
                },
                body: JSON.stringify({
                    source_wallet: "65245a75f38cafb8ea703883",
                    receivers_address: merchantAddress,
                    amount: 1,
                    chain: "BASE",
                    token: "USDC"
                })
            });

            if (!response.ok) {
                const responseBody = await response.json();
                console.error('Server error:', responseBody);
                toast.error(responseBody.message || 'Failed to submit');
                return;
            }

            const responseData = await response.json();
            const referenceId = responseData.data.reference_id;

            // Wait for a short time before checking status
            await new Promise(resolve => setTimeout(resolve, 5000));

            const isSuccessful = await checkTransactionStatus(referenceId);

            if (isSuccessful) {
                toast.success("Payment transferred to merchant successfully");
                close()
            } else {
                toast.error("Transaction failed or is still pending. Please check again later.");
            }
        } catch (error) {
            console.error('Error while transferring to merchant', error);
            toast.error("Failed to transfer payment to merchant. Please contact support.");
        }
    }

    const onSubmit = async () => {
        setLoading(true);

        try {
            const response = await fetch('https://sandbox-api.kotanipay.io/api/v3/deposit/bank/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer eyJ1c2VyX2lkIjoiNjRlNzFhNjg4NWRiZDQ2MjkzN2JhZWJiIiwiY3JlYXRlZF9hdCI6IjIwMjQtMDktMjFUMTI6NDg6MzIuMjgyWiJ9.95d13e5d5547a9c2f86e44f4f58c2b7869e26ac0d72918cfd6a037d689312810'
                },
                body: JSON.stringify({
                    
                        // customer_key: "L6BJsN2dUKd1lljIhdVF",
                        // amount: amount,
                        // wallet_id: "670b955cbefa8743b0924f06"
                      
                    phoneNumber: phone,
                    fullName: name,
                    amount: amount,
                    currency: currency,
                    wallet_id: "66efbf0c2fa0ee24e3d28e25",
                    reference_id: Math.floor(Math.random() * 90000000) + 10000000,
                }),
            });

            if (!response.ok) {
                const responseBody = await response.json();
                console.error('Server error:', responseBody);
                toast.error(responseBody.message || 'Failed to submit');
                return;
            }

            const responseData = await response.json();
            toast.success("Payment was sent successfully")
            console.log(responseData)
            await sendToMerchantWallet();
            reset()
            onClose
        } catch (error) {
            console.error('Error while making payment', error);
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className='bg-[#B2BEB5] border rounded-xl flex items-center justify-center p-10 shadow-2xl w-full lg:w-1/3'>
                <div className="w-full space-y-6">
                    <h1 className='flex items-center justify-center text-[#FFFFFF] font-semibold text-xl'>Make Payment</h1>
                    <div className="space-y-1">
                        <Label>Account Name</Label>
                        <Input
                            type="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='John Doe'
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Phone Number</Label>
                        <Input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder='+254768685444'
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Amount</Label>
                        <Input
                            type="number"
                            value={amount.toString()}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            placeholder='100'
                            required
                        />
                    </div>
                    <div className='space-y-1'>
                        <Label>Currency</Label>
                        <Select value={currency} onValueChange={(val) => setCurrency(val)}>
                            <SelectTrigger >
                                <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                            <SelectContent className='bg-gray-100'>
                                <SelectItem value='KES'>KES</SelectItem>
                                <SelectItem value='ZAR'>ZAR</SelectItem>

                            </SelectContent>
                        </Select>

                    </div>
                    <div>
                    </div>
                 <div className='flex flex-row gap-4 items-center justify-center'>
                 <button className='w-full bg-[#FFE840] hover:bg-[#363FF9] text-white font-bold p-2 rounded ' onClick={onSubmit} disabled={loading}>
                        {loading && <Loader2 className="w-6 h-6 mr-2 animate-spin" />}
                        {loading ? 'Paying...' : 'Pay'}
                    </button>

                    <button
                        className="w-full bg-[#FFE840] hover:bg-[#363FF9]  text-white font-bold p-2 rounded"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                 </div>

                </div>
            </div>
        </div>
    );
}

export default Pay